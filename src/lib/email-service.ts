import nodemailer, { Transporter } from 'nodemailer';
import { prisma } from '@/lib/db';
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

const DEFAULT_CONFIG: SmtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  fromName: process.env.SMTP_FROM_NAME || 'HUB CLOUD IT Solutions',
  fromEmail: process.env.SMTP_FROM_EMAIL || 's@hubcloud.info',
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL || 's@hubcloud.info',
  orderEmailsEnabled: true,
  adminAlertsEnabled: true,
};

let memorySmtpConfig: SmtpConfig | null = null;

export async function getSmtpConfig(): Promise<SmtpConfig> {
  if (memorySmtpConfig) return memorySmtpConfig;
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: 'smtp_config' },
    });
    if (record?.value) {
      const merged: SmtpConfig = { ...DEFAULT_CONFIG, ...(record.value as any) };
      memorySmtpConfig = merged;
      return merged;
    }
  } catch (error) {
    // safely fallback to defaults/env
  }
  return DEFAULT_CONFIG;
}

export async function saveSmtpConfig(newConfig: Partial<SmtpConfig>): Promise<SmtpConfig> {
  const current = await getSmtpConfig();

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
    await prisma.systemSetting.upsert({
      where: { key: 'smtp_config' },
      create: {
        key: 'smtp_config',
        value: merged as any,
      },
      update: {
        value: merged as any,
      },
    });
  } catch (err) {
    console.warn('[email-service] Could not write SMTP config to database:', err);
  }

  return merged;
}

export async function getEmailLogs(): Promise<EmailLog[]> {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return logs.map((l) => ({
      id: l.id,
      to: l.to,
      subject: l.subject,
      type: l.type as any,
      orderId: l.orderId || undefined,
      status: l.status as any,
      errorMessage: l.errorMessage || undefined,
      createdAt: l.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error reading email logs from database:', error);
    return [];
  }
}

export async function recordEmailLog(entry: Omit<EmailLog, 'id' | 'createdAt'>): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        to: entry.to,
        subject: entry.subject,
        type: entry.type,
        orderId: entry.orderId || null,
        status: entry.status,
        errorMessage: entry.errorMessage || null,
      },
    });
  } catch (error) {
    console.error('Error recording email log to database:', error);
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
    const baseConfig = await getSmtpConfig();
    const config = customConfig ? { ...baseConfig, ...customConfig } : baseConfig;
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

    await recordEmailLog({
      to: targetEmail,
      subject: 'تجربة إرسال بريد إلكتروني',
      type: 'TEST_EMAIL',
      status: 'SENT',
    });

    return { success: true, message: `تم إرسال البريد التجريبي بنجاح إلى ${targetEmail}` };
  } catch (error: any) {
    const errorMsg = error.message || 'فشل الاتصال بخادم البريد';
    await recordEmailLog({
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
  const config = await getSmtpConfig();

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

      await recordEmailLog({
        to: order.customerEmail,
        subject: `تأكيد طلبك رقم #${order.id}`,
        type: 'ORDER_CONFIRMATION',
        orderId: order.id,
        status: 'SENT',
      });
      console.log(`[EmailService] Order confirmation sent to ${order.customerEmail}`);
    } catch (err: any) {
      console.error(`[EmailService] Failed to send customer confirmation for order ${order.id}:`, err.message);
      await recordEmailLog({
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

      await recordEmailLog({
        to: adminEmails.join(', '),
        subject: `طلب جديد #${order.id}`,
        type: 'ADMIN_NOTIFICATION',
        orderId: order.id,
        status: 'SENT',
      });
      console.log(`[EmailService] Admin order alert sent to ${adminEmails.join(', ')}`);
    } catch (err: any) {
      console.error(`[EmailService] Failed to send admin alert for order ${order.id}:`, err.message);
      await recordEmailLog({
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
  const config = await getSmtpConfig();

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

      await recordEmailLog({
        to: order.customerEmail,
        subject: `تحديث حالة طلبك رقم #${order.id} (${statusToUse})`,
        type: 'ORDER_STATUS_UPDATE',
        orderId: order.id,
        status: 'SENT',
      });
      console.log(`[EmailService] Status update email (${statusToUse}) sent to ${order.customerEmail}`);
    } catch (err: any) {
      console.error(`[EmailService] Failed to send status update email for order ${order.id}:`, err.message);
      await recordEmailLog({
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

