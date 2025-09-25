import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email notifications will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("Email would be sent:", params.subject);
    return true; // Return true for development
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || "",
      html: params.html || params.text || "",
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendBillReminderEmail(
  userEmail: string,
  userName: string,
  billName: string,
  amount: string,
  dueDate: string
): Promise<boolean> {
  const subject = `🔔 Lembrete: ${billName} vence em breve`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">FinanFamily - Lembrete de Vencimento</h2>
      
      <p>Olá, ${userName}!</p>
      
      <p>Este é um lembrete de que a conta <strong>${billName}</strong> está próxima do vencimento.</p>
      
      <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #92400E;">Detalhes da Conta</h3>
        <p style="margin: 10px 0;"><strong>Conta:</strong> ${billName}</p>
        <p style="margin: 10px 0;"><strong>Valor:</strong> R$ ${amount}</p>
        <p style="margin: 10px 0;"><strong>Vencimento:</strong> ${dueDate}</p>
      </div>
      
      <p>Não esqueça de efetuar o pagamento para evitar juros e multas.</p>
      
      <p style="color: #6B7280; font-size: 14px;">
        Este é um e-mail automático do sistema FinanFamily.
      </p>
    </div>
  `;

  const text = `
FinanFamily - Lembrete de Vencimento

Olá, ${userName}!

A conta ${billName} no valor de R$ ${amount} vence em ${dueDate}.

Não esqueça de efetuar o pagamento para evitar juros e multas.
  `;

  return sendEmail({
    to: userEmail,
    from: "noreply@finanfamily.com",
    subject,
    html,
    text
  });
}

export async function sendOverdueNotificationEmail(
  userEmail: string,
  userName: string,
  billName: string,
  amount: string,
  daysOverdue: number
): Promise<boolean> {
  const subject = `🚨 URGENTE: ${billName} está em atraso`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">FinanFamily - Conta em Atraso</h2>
      
      <p>Olá, ${userName}!</p>
      
      <p>A conta <strong>${billName}</strong> está em atraso há ${daysOverdue} dia(s).</p>
      
      <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
        <h3 style="margin: 0; color: #B91C1C;">Atenção - Conta em Atraso</h3>
        <p style="margin: 10px 0;"><strong>Conta:</strong> ${billName}</p>
        <p style="margin: 10px 0;"><strong>Valor:</strong> R$ ${amount}</p>
        <p style="margin: 10px 0;"><strong>Atraso:</strong> ${daysOverdue} dia(s)</p>
      </div>
      
      <p>Recomendamos efetuar o pagamento o quanto antes para evitar prejuízos ao seu CPF.</p>
      
      <p style="color: #6B7280; font-size: 14px;">
        Este é um e-mail automático do sistema FinanFamily.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: "noreply@finanfamily.com",
    subject,
    html,
    text: `A conta ${billName} (R$ ${amount}) está em atraso há ${daysOverdue} dia(s). Efetue o pagamento o quanto antes.`
  });
}
