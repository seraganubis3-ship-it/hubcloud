import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import {
  renderOrderConfirmationHtml,
  renderAdminOrderNotificationHtml,
  renderTestEmailHtml,
  renderOrderStatusUpdateHtml,
} from './email-templates';

export {
  renderOrderConfirmationHtml,
  renderAdminOrderNotificationHtml,
  renderTestEmailHtml,
  renderOrderStatusUpdateHtml,
};

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  adminNotifyEmail: string;
  orderEmailsEnabled: boolean;
  adminAlertsEnabled: boolean;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  type: 'ORDER_CONFIRMATION' | 'ADMIN_NOTIFICATION' | 'TEST_EMAIL' | 'ORDER_STATUS_UPDATE';
  orderId?: string;
  status: 'SENT' | 'FAILED';
  errorMessage?: string;
  createdAt: string;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'smtp-config.json');
const LOGS_FILE_PATH = path.join(process.cwd(), 'data', 'email-logs.json');

const DEFAULT_CONFIG: SmtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  fromName: process.env.SMTP_FROM_NAME || 'HUB CLOUD IT Solutions',
  fromEmail: process.env.SMTP_FROM_EMAIL || 'sales@hubcloud.info',
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL || 'sales@hubcloud.info',
  orderEmailsEnabled: true,
  adminAlertsEnabled: true,
};

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let memorySmtpConfig: SmtpConfig | null = null;

export function getSmtpConfig(): SmtpConfig {
  if (memorySmtpConfig) return memorySmtpConfig;
  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (error) {
    // Readonly filesystem or error, safely fallback to defaults/env
  }
  return DEFAULT_CONFIG;
}

export function saveSmtpConfig(newConfig: Partial<SmtpConfig>): SmtpConfig {
  const current = getSmtpConfig();

  // If incoming password is empty or masked '••••••••', keep existing password
  let passwordToSave = current.pass;
  if (newConfig.pass && !newConfig.pass.startsWith('••••')) {
    passwordToSave = newConfig.pass;
  }

  const merged: SmtpConfig = {
    ...current,
    ...newConfig,
    port: Number(newConfig.port) || current.port,
    secure: Boolean(newConfig.secure),
    pass: passwordToSave,
  };

  memorySmtpConfig = merged;

  try {
    ensureDataDir();
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[email-service] Could not write SMTP config to disk (possibly read-only filesystem). Retaining in memory:', err);
  }

  return merged;
}

export function getEmailLogs(): EmailLog[] {
  try {
    ensureDataDir();
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const raw = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error reading email logs:', error);
  }
  return [];
}

export function recordEmailLog(entry: Omit<EmailLog, 'id' | 'createdAt'>) {
  try {
    ensureDataDir();
    const logs = getEmailLogs();
    const newLog: EmailLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...entry,
      createdAt: new Date().toISOString(),
    };
    // Keep last 100 logs
    const updated = [newLog, ...logs].slice(0, 100);
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error recording email log:', error);
  }
}

function createTransporter(config: SmtpConfig) {
  if (!config.host || !config.user) {
    throw new Error('بيانات خادم الـ SMTP غير مكتملة (Host / User مفقود)');
  }

  return nodemailer.createTransport({
    host: config.host.trim(),
    port: config.port,
    secure: config.secure, // true for 465, false for 587/25
    auth: {
      user: config.user.trim(),
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed certificate rejection
    },
    connectionTimeout: 10000,
  });
}

// -------------------------------------------------------------
// Core Sending Functions
// -------------------------------------------------------------

export async function testSmtpConnection(
  targetEmail: string,
  customConfig?: Partial<SmtpConfig>
): Promise<{ success: boolean; message: string }> {
  try {
    const config = customConfig ? { ...getSmtpConfig(), ...customConfig } : getSmtpConfig();
    const transporter = createTransporter(config);

    // 1. Verify connection
    await transporter.verify();

    // 2. Send test email
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
      to: targetEmail.trim(),
      subject: 'تجربة إرسال بريد إلكتروني — HUB CLOUD IT Solutions',
      html: renderTestEmailHtml(config),
    });

    recordEmailLog({
      to: targetEmail,
      subject: 'تجربة إرسال بريد إلكتروني',
      type: 'TEST_EMAIL',
      status: 'SENT',
    });

    return { success: true, message: `تم إرسال البريد التجريبي بنجاح إلى ${targetEmail}` };
  } catch (error: any) {
    const errorMsg = error.message || 'فشل الاتصال بخادم البريد';
    recordEmailLog({
      to: targetEmail,
      subject: 'تجربة إرسال بريد إلكتروني',
      type: 'TEST_EMAIL',
      status: 'FAILED',
      errorMessage: errorMsg,
    });
    return { success: false, message: errorMsg };
  }
}

export async function sendOrderConfirmationEmails(order: any): Promise<void> {
  const config = getSmtpConfig();

  // If host or user is missing, silently skip without throwing
  if (!config.host || !config.user) {
    console.log('[EmailService] SMTP not configured. Skipping order notification dispatch.');
    return;
  }

  let transporter: Transporter;
  try {
    transporter = createTransporter(config);
  } catch (err: any) {
    console.error('[EmailService] Failed to initialize transporter:', err.message);
    return;
  }

  const sender = `"${config.fromName}" <${config.fromEmail || config.user}>`;

  // 1. Send Order Confirmation to Customer
  if (config.orderEmailsEnabled && order.customerEmail) {
    try {
      await transporter.sendMail({
        from: sender,
        to: order.customerEmail,
        subject: `تأكيد طلبك رقم #${order.id} من HUB CLOUD`,
        html: renderOrderConfirmationHtml(order),
      });

      recordEmailLog({
        to: order.customerEmail,
        subject: `تأكيد طلبك رقم #${order.id}`,
        type: 'ORDER_CONFIRMATION',
        orderId: order.id,
        status: 'SENT',
      });
      console.log(`[EmailService] Order confirmation sent to ${order.customerEmail}`);
    } catch (err: any) {
      console.error(`[EmailService] Failed to send customer confirmation for order ${order.id}:`, err.message);
      recordEmailLog({
        to: order.customerEmail,
        subject: `تأكيد طلبك رقم #${order.id}`,
        type: 'ORDER_CONFIRMATION',
        orderId: order.id,
        status: 'FAILED',
        errorMessage: err.message,
      });
    }
  }

  // 2. Send New Order Alert to Admin (Supports multiple recipient emails)
  const adminEmails = (config.adminNotifyEmail || '')
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter((e) => e && e.includes('@'));

  if (config.adminAlertsEnabled && adminEmails.length > 0) {
    try {
      await transporter.sendMail({
        from: sender,
        to: adminEmails,
        subject: `🔔 طلب جديد #${order.id} بقيمة ${Number(order.total).toLocaleString()} ج.م - HUB CLOUD`,
        html: renderAdminOrderNotificationHtml(order),
      });

      recordEmailLog({
        to: adminEmails.join(', '),
        subject: `طلب جديد #${order.id}`,
        type: 'ADMIN_NOTIFICATION',
        orderId: order.id,
        status: 'SENT',
      });
      console.log(`[EmailService] Admin order alert sent to ${adminEmails.join(', ')}`);
    } catch (err: any) {
      console.error(`[EmailService] Failed to send admin alert for order ${order.id}:`, err.message);
      recordEmailLog({
        to: adminEmails.join(', '),
        subject: `طلب جديد #${order.id}`,
        type: 'ADMIN_NOTIFICATION',
        orderId: order.id,
        status: 'FAILED',
        errorMessage: err.message,
      });
    }
  }
}

export async function sendOrderStatusUpdateEmail(order: any, newStatus?: string): Promise<void> {
  const config = getSmtpConfig();

  if (!config.host || !config.user) {
    console.log('[EmailService] SMTP not configured. Skipping status update email dispatch.');
    return;
  }

  const statusToUse = newStatus || order.orderStatus || 'processing';

  let transporter: Transporter;
  try {
    transporter = createTransporter(config);
  } catch (err: any) {
    console.error('[EmailService] Failed to initialize transporter:', err.message);
    return;
  }

  const sender = `"${config.fromName}" <${config.fromEmail || config.user}>`;

  if (config.orderEmailsEnabled && order.customerEmail) {
    try {
      await transporter.sendMail({
        from: sender,
        to: order.customerEmail,
        subject: `تحديث حالة طلبك رقم #${order.id} من HUB CLOUD`,
        html: renderOrderStatusUpdateHtml(order, statusToUse),
      });

      recordEmailLog({
        to: order.customerEmail,
        subject: `تحديث حالة طلبك رقم #${order.id} (${statusToUse})`,
        type: 'ORDER_STATUS_UPDATE',
        orderId: order.id,
        status: 'SENT',
      });
      console.log(`[EmailService] Status update email (${statusToUse}) sent to ${order.customerEmail}`);
    } catch (err: any) {
      console.error(`[EmailService] Failed to send status update email for order ${order.id}:`, err.message);
      recordEmailLog({
        to: order.customerEmail,
        subject: `تحديث حالة طلبك رقم #${order.id} (${statusToUse})`,
        type: 'ORDER_STATUS_UPDATE',
        orderId: order.id,
        status: 'FAILED',
        errorMessage: err.message,
      });
    }
  }
}
