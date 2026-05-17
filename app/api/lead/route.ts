import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { lead, result, observations } = body;

    await resend.emails.send({
      from: "FamilieTryg <onboarding@resend.dev>",
      to: [lead.email],
      subject: "Dit FamilieTryg-overblik er klar",

      html: `
        <div style="font-family: Arial, sans-serif; background:#F4FAFA; padding:32px;">
          <div style="max-width:620px; margin:0 auto; background:white; border-radius:24px; padding:32px; color:#253457;">

            <p style="color:#4FB7E7; font-weight:700; letter-spacing:2px; text-transform:uppercase;">
              FamilieTryg
            </p>

            <h1 style="font-size:30px; margin-top:10px;">
              Dit FamilieTryg-overblik
            </h1>

            <p style="margin-top:24px;">
              Hej ${lead.name},
            </p>

            <p>
              Tak fordi du gennemførte FamilieTryg Tjek.
            </p>

            <div style="margin-top:28px; padding:22px; background:#FFF7F7; border:1px solid #F4C7C7; border-radius:18px;">
              <strong style="font-size:18px;">
                Din vurdering: ${result}
              </strong>

              <p style="margin-top:12px; line-height:1.6;">
                Flere af dine svar indikerer, at der kan være forhold omkring arv,
                begunstigelser eller fremtidsfuldmagter, som kan være relevante
                at få gennemgået nærmere.
              </p>
            </div>

            <div style="margin-top:28px;">
              <h2 style="font-size:20px;">
                Forhold vi har markeret
              </h2>

              ${observations
                .map(
                  (item: any) => `
                    <div style="margin-top:18px; padding:18px; border:1px solid #E5E7EB; border-radius:16px;">
                      <strong>${item.title}</strong>

                      <p style="margin-top:8px; color:#667085; line-height:1.6;">
                        ${item.text}
                      </p>
                    </div>
                  `
                )
                .join("")}
            </div>

            <p style="margin-top:32px; color:#667085; line-height:1.7;">
              Resultatet er vejledende og udgør ikke juridisk,
              finansiel eller investeringsmæssig rådgivning.
            </p>

            <p style="margin-top:32px;">
              Venlig hilsen<br/>
              RådgiverXperten
            </p>

          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}