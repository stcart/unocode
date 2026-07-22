import nodemailer from "nodemailer";

type MailTransporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: MailTransporter | null | undefined;

function getTransporter(): MailTransporter | null {
  if (transporter !== undefined) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  return transporter;
}

export async function sendTestTaskPublishedEmails(input: {
  cohortName: string;
  recipients: string[];
}): Promise<void> {
  const uniqueRecipients = [...new Set(input.recipients.filter(Boolean))];

  if (uniqueRecipients.length === 0) {
    console.log("[email] Нет получателей для уведомления о тестовом задании");
    return;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@praktika.local";
  const subject = `Тестовое задание опубликовано: ${input.cohortName}`;
  const text =
    `Опубликовано тестовое задание для когорты «${input.cohortName}».\n\n` +
    "Откройте личный кабинет или страницу заявки, чтобы прочитать задание.";

  const mailer = getTransporter();

  if (!mailer) {
    console.log(
      `[email stub] Тестовое задание опубликовано для когорты «${input.cohortName}». Получатели: ${uniqueRecipients.join(", ")}`
    );
    return;
  }

  await mailer.sendMail({
    from,
    to: uniqueRecipients.join(", "),
    subject,
    text,
  });
}
