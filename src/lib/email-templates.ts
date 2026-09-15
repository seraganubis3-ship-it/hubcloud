export function renderOrderConfirmationHtml(order: any): string {
  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const specs = [item.selectedRam, item.selectedStorage, item.selectedWarranty]
        .filter(Boolean)
        .join(' | ');

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 8px; font-size: 13px; color: #1e293b;">
            <strong>${item.productNameAr || item.productName}</strong>
            ${specs ? `<br><span style="font-size: 11px; color: #64748b;">${specs}</span>` : ''}
          </td>
          <td style="padding: 12px 8px; text-align: center; font-size: 13px; color: #334155;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-size: 13px; color: #334155; font-family: monospace;">
            ${Number(item.unitPrice).toLocaleString()} ج.م
          </td>
          <td style="padding: 12px 8px; text-align: right; font-size: 13px; font-weight: bold; color: #003882; font-family: monospace;">
            ${Number(item.totalPrice).toLocaleString()} ج.م
          </td>
        </tr>
      `;
    })
    .join('');

  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد طلبك من HUB CLOUD</title>
  </head>
  <body style="margin:0; padding:0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
    <div style="max-width: 650px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      
      <!-- Top Brand Header -->
      <div style="background-color: #003882; padding: 28px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
          HUB CLOUD
        </h1>
        <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 12px; font-weight: 600;">
          حلول تكنولوجيا المعلومات ومحطات العمل وتجهيزات الشبكات
        </p>
      </div>

      <!-- Hero Greeting -->
      <div style="padding: 24px 24px 16px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #ecfdf5; color: #059669; border-radius: 50%; font-size: 24px; margin-bottom: 12px;">✓</div>
        <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a; font-weight: 800;">
          شكراً لطلبك، ${order.customerName}!
        </h2>
        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
          تم استلام طلبك بنجاح وهو الآن قيد المراجعة والتجهيز من قبل فريق الدعم واللوجستيات.
        </p>
      </div>

      <!-- Order Meta Badge -->
      <div style="margin: 20px 24px; padding: 14px 18px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
        <div>
          <span style="color: #64748b;">رقم الطلب:</span>
          <strong style="color: #003882; font-family: monospace; font-size: 15px; margin-right: 6px;">#${order.id}</strong>
        </div>
        <div>
          <span style="color: #64748b;">تاريخ الطلب:</span>
          <strong style="color: #334155; margin-right: 6px;">${new Date(order.createdAt || Date.now()).toLocaleDateString('ar-EG')}</strong>
        </div>
      </div>

      <!-- Products Table -->
      <div style="padding: 0 24px 20px 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; border-bottom: 2px solid #003882; padding-bottom: 6px; display: inline-block;">
          تفاصيل المنتجات في الطلب
        </h3>
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 10px 8px; font-size: 12px; color: #475569;">المنتج</th>
              <th style="padding: 10px 8px; font-size: 12px; color: #475569; text-align: center;">الكمية</th>
              <th style="padding: 10px 8px; font-size: 12px; color: #475569; text-align: right;">السعر</th>
              <th style="padding: 10px 8px; font-size: 12px; color: #475569; text-align: right;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals Summary Breakdown -->
        <div style="margin-top: 20px; background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
          <table style="width: 100%; font-size: 13px; color: #334155;">
            <tr>
              <td style="padding: 4px 0;">المجموع الفرعي:</td>
              <td style="padding: 4px 0; text-align: left; font-family: monospace;">${Number(order.subtotal).toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">ضريبة القيمة المضافة (14%):</td>
              <td style="padding: 4px 0; text-align: left; font-family: monospace;">${Number(order.vat).toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">الشحن والتوصيل:</td>
              <td style="padding: 4px 0; text-align: left; font-family: monospace;">
                ${order.shipping === 0 ? '<span style="color:#059669; font-weight:bold;">مجاني</span>' : `${Number(order.shipping).toLocaleString()} ج.م`}
              </td>
            </tr>
            ${
              order.discount > 0
                ? `
            <tr>
              <td style="padding: 4px 0; color: #dc2626;">خصم ترويجي:</td>
              <td style="padding: 4px 0; text-align: left; color: #dc2626; font-family: monospace;">- ${Number(order.discount).toLocaleString()} ج.م</td>
            </tr>
            `
                : ''
            }
            <tr style="border-top: 1px solid #cbd5e1; font-weight: bold; font-size: 16px; color: #003882;">
              <td style="padding: 10px 0 0 0;">الإجمالي النهائي المطلوب:</td>
              <td style="padding: 10px 0 0 0; text-align: left; font-family: monospace;">${Number(order.total).toLocaleString()} ج.م</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Shipping & Payment Details -->
      <div style="padding: 0 24px 24px 24px; display: grid; gap: 14px;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #003882;">عنوان وبيانات التوصيل:</h4>
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
            <strong>العميل:</strong> ${order.customerName}<br>
            <strong>رقم الهاتف:</strong> ${order.customerPhone}<br>
            <strong>المدينة والعنوان:</strong> ${order.city} - ${order.address}
            ${order.notes ? `<br><strong>ملاحظات العميل:</strong> ${order.notes}` : ''}
          </p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #003882;">طريقة الدفع:</h4>
          <p style="margin: 0; font-size: 12px; color: #475569;">
            ${
              order.paymentMethod === 'cod'
                ? 'الدفع عند الاستلام (نقداً لمندوب الشحن)'
                : order.paymentMethod === 'instapay'
                ? 'تحويل فوري عبر إنستاباي (InstaPay)'
                : 'محفظة إلكترونية (Vodafone Cash)'
            }
            — <span style="color: #d97706; font-weight: bold;">${order.paymentStatus === 'paid' ? 'تم الدفع بنجاح' : 'في انتظار التحصيل'}</span>
          </p>
        </div>
      </div>

      <!-- WhatsApp / Help Call to Action -->
      <div style="background: #eff6ff; padding: 18px 24px; text-align: center; border-top: 1px solid #dbeafe;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #1e40af; font-weight: 600;">
          هل لديك أي استفسار حول طلبك؟ تواصل معنا مباشرة على واتساب
        </p>
        <a href="https://wa.me/201060777895?text=${encodeURIComponent('مرحباً، أستفسر عن طلبي رقم #' + order.id)}" 
           style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 9999px; font-weight: bold; font-size: 13px; box-shadow: 0 2px 8px rgba(37,211,102,0.3);">
          تواصل عبر واتساب المبيعات
        </a>
      </div>

      <!-- Corporate Footer -->
      <div style="background: #0f172a; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 11px;">
        <p style="margin: 0 0 4px 0;">
          HUB CLOUD IT Solutions — 181 شارع السودان، الدور التاسع، المهندسين، الجيزة
        </p>
        <p style="margin: 0;">
          هاتف: +20 010 60 777 895 | البريد: sales@hubcloud.info
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
}

export function renderAdminOrderNotificationHtml(order: any): string {
  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <title>تنبيه: طلب جديد #${order.id}</title>
  </head>
  <body style="margin:0; padding:0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #ffffff;">
        <span style="background: #2563eb; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold;">طلب جديد وارد</span>
        <h2 style="margin: 10px 0 0 0; font-size: 18px;">طلب جديد رقم #${order.id}</h2>
      </div>

      <div style="padding: 20px;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">
          قام العميل <strong>${order.customerName}</strong> بإتمام طلب جديد بإجمالي <strong>${Number(order.total).toLocaleString()} ج.م</strong>.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569; margin: 16px 0;">
          <p style="margin: 2px 0;"><strong>رقم الهاتف:</strong> ${order.customerPhone}</p>
          <p style="margin: 2px 0;"><strong>البريد:</strong> ${order.customerEmail}</p>
          <p style="margin: 2px 0;"><strong>العنوان:</strong> ${order.city} - ${order.address}</p>
          <p style="margin: 2px 0;"><strong>طريقة الدفع:</strong> ${order.paymentMethod}</p>
          <p style="margin: 2px 0;"><strong>عدد المنتجات:</strong> ${order.items?.length || 0}</p>
        </div>

        <div style="text-align: center; margin: 24px 0 10px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/orders"
             style="background: #003882; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
            فتح تفاصيل الطلب في لوحة الأدمن
          </a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function renderTestEmailHtml(config: { host: string; port: number; secure: boolean; fromName: string; fromEmail: string }): string {
  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <title>بريد تجريبي من HUB CLOUD</title>
  </head>
  <body style="margin:0; padding:0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
    <div style="max-width: 550px; margin: 30px auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
      <div style="background: #003882; padding: 22px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800;">HUB CLOUD IT Solutions</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #93c5fd;">اختبار اتصال خادم الـ SMTP</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; color: #065f46; font-size: 13px; margin-bottom: 16px;">
          ✓ <strong>تم إرسال هذا البريد التجريبي بنجاح!</strong>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">
            خادم البريد الخاص بك (${config.host}) متصل وجاهز لإرسال إشعارات الطلبات وتأكيدات الشراء.
          </p>
        </div>
        <table style="width: 100%; font-size: 12px; color: #475569; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">خادم الـ Host:</td>
            <td style="padding: 6px 0; font-family: monospace;">${config.host}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">المنفذ (Port):</td>
            <td style="padding: 6px 0; font-family: monospace;">${config.port} (${config.secure ? 'SSL' : 'TLS/STARTTLS'})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">بريد الإرسال:</td>
            <td style="padding: 6px 0; font-family: monospace;">${config.fromEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">اسم المرسل:</td>
            <td style="padding: 6px 0;">${config.fromName}</td>
          </tr>
        </table>
      </div>
      <div style="background: #f1f5f9; padding: 12px 20px; text-align: center; font-size: 11px; color: #64748b;">
        تم الإنشاء تلقائياً عبر نظام إدارة متجر HUB CLOUD
      </div>
    </div>
  </body>
  </html>
  `;
}

export function renderOrderStatusUpdateHtml(order: any, newStatus: string): string {
  const getStatusDetails = (st: string) => {
    switch (st) {
      case 'shipped':
        return {
          title: 'طلبك في الطريق إليك الآن!',
          badge: 'تم الشحن (Shipped)',
          bgColor: '#eff6ff',
          borderColor: '#bfdbfe',
          textColor: '#1d4ed8',
          icon: '🚚',
          desc: 'تم تسليم شحنتك لمندوب التوصيل وهي الآن في طريقها إلى عنوانك المسجل.',
        };
      case 'delivered':
        return {
          title: 'تم تسليم طلبك بنجاح!',
          badge: 'تم التوصيل (Delivered)',
          bgColor: '#ecfdf5',
          borderColor: '#a7f3d0',
          textColor: '#047857',
          icon: '🎉',
          desc: 'نأمل أن تنال المنتجات كامل إعجابكم ورضاكم. شكراً لثقتكم واختياركم HUB CLOUD.',
        };
      case 'cancelled':
        return {
          title: 'تم إلغاء الطلب',
          badge: 'ملغي (Cancelled)',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#b91c1c',
          icon: '✕',
          desc: 'تم إلغاء هذا الطلب. إذا كان لديك أي استفسار أو ترغب في إعادة الطلب يمكنك التواصل مباشرة مع خدمة العملاء.',
        };
      case 'processing':
      default:
        return {
          title: 'طلبك قيد التجهيز والمراجعة',
          badge: 'قيد التجهيز (Processing)',
          bgColor: '#fffbeb',
          borderColor: '#fde68a',
          textColor: '#b45309',
          icon: '📦',
          desc: 'فريق العمل يقوم حالياً بفحص وتجهيز المنتجات وتعبئتها للشحن بأعلى معايير الأمان.',
        };
    }
  };

  const statusInfo = getStatusDetails(newStatus);

  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحديث حالة طلبك #${order.id} - HUB CLOUD</title>
  </head>
  <body style="margin:0; padding:0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      
      <!-- Top Brand Header -->
      <div style="background-color: #003882; padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 1px;">
          HUB CLOUD
        </h1>
        <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 12px;">
          حلول تكنولوجيا المعلومات ومحطات العمل وتجهيزات الشبكات
        </p>
      </div>

      <!-- Status Hero Banner -->
      <div style="padding: 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
        <div style="font-size: 36px; margin-bottom: 8px;">${statusInfo.icon}</div>
        <h2 style="margin: 0 0 8px 0; font-size: 19px; color: #0f172a; font-weight: 800;">
          ${statusInfo.title}
        </h2>
        <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 13px; font-weight: bold; background: ${statusInfo.bgColor}; color: ${statusInfo.textColor}; border: 1px solid ${statusInfo.borderColor}; margin-bottom: 12px;">
          الحالة الحالية: ${statusInfo.badge}
        </div>
        <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6; max-width: 480px; margin: 0 auto;">
          ${statusInfo.desc}
        </p>
      </div>

      <!-- Order Details Summary Box -->
      <div style="margin: 20px 24px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #334155; line-height: 1.8;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
          <span>رقم الطلب: <strong style="color: #003882; font-family: monospace;">#${order.id}</strong></span>
          <span>الإجمالي: <strong style="color: #003882; font-family: monospace;">${Number(order.total).toLocaleString()} ج.م</strong></span>
        </div>
        <div><strong>العميل المستلم:</strong> ${order.customerName} (${order.customerPhone})</div>
        <div><strong>عنوان التوصيل:</strong> ${order.city} - ${order.address}</div>
        <div><strong>عدد المنتجات:</strong> ${order.items?.length || 1} منتج</div>
      </div>

      <!-- WhatsApp / Support CTA -->
      <div style="background: #eff6ff; padding: 18px 24px; text-align: center; border-top: 1px solid #dbeafe;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #1e40af; font-weight: 600;">
          هل لديك أي استفسار أو ترغب في تعديل موعد التسليم؟
        </p>
        <a href="https://wa.me/201060777895?text=${encodeURIComponent('مرحباً، أستفسر عن تحديث حالة طلبي رقم #' + order.id)}" 
           style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 9px 20px; border-radius: 9999px; font-weight: bold; font-size: 12px; box-shadow: 0 2px 8px rgba(37,211,102,0.25);">
          تواصل مع الدعم عبر واتساب
        </a>
      </div>

      <!-- Footer -->
      <div style="background: #0f172a; padding: 18px 20px; text-align: center; color: #94a3b8; font-size: 11px;">
        <p style="margin: 0;">HUB CLOUD IT Solutions — 181 شارع السودان، المهندسين، الجيزة | هاتف: +20 010 60 777 895</p>
      </div>

    </div>
  </body>
  </html>
  `;
}
