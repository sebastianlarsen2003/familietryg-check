import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { lead, result, observations } = body;

    if (!lead?.name || !lead?.email) {
      return NextResponse.json(
        { error: "Missing lead name or email" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "FamilieTryg <onboarding@resend.dev>",
      to: [lead.email],
      subject: "Dit FamilieTryg-overblik er klar",
      html: `
        <div style="margin:0;padding:0;background:#F3F8F9;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:28px 18px;">
            <div style="background:#ffffff;border-radius:28px;padding:34px 24px;border:1px solid #E7EEF2;">

              <div style="margin-bottom:28px;">
                <div style="font-size:13px;font-weight:800;letter-spacing:3px;color:#4FB7E7;text-transform:uppercase;">
                  FamilieTryg
                </div>

                <div style="margin-top:8px;font-size:12px;color:#98A2B3;font-weight:600;">
                  by RådgiverXperten
                </div>
              </div>

              <h1 style="margin:0;font-size:38px;line-height:1.02;color:#253457;font-weight:900;letter-spacing:-2px;">
                Dit FamilieTryg-overblik
              </h1>

              <p style="margin-top:26px;font-size:18px;line-height:1.7;color:#344054;">
                Hej ${lead.name},
              </p>

              <p style="margin-top:14px;font-size:17px;line-height:1.8;color:#475467;">
                Tak fordi du gennemførte FamilieTryg Tjek.
              </p>

              <div style="margin-top:30px;padding:24px;border-radius:22px;background:#FFF7F7;border:1px solid #F7D4D4;">
                <div style="font-size:14px;font-weight:800;color:#B42318;text-transform:uppercase;letter-spacing:1px;">
                  Din vurdering
                </div>

                <div style="margin-top:10px;font-size:34px;line-height:1.05;font-weight:900;color:#253457;letter-spacing:-1px;">
                  ${result}
                </div>

                <p style="margin-top:18px;font-size:16px;line-height:1.8;color:#475467;">
                  Flere af dine svar indikerer, at der kan være forhold omkring arv,
                  pension, begunstigelser eller fremtidsfuldmagter, som kan være relevante
                  at få gennemgået nærmere.
                </p>
              </div>

              <div style="margin-top:34px;">
                <div style="font-size:24px;font-weight:900;color:#253457;letter-spacing:-0.5px;">
                  Forhold vi har markeret
                </div>

                <div style="margin-top:20px;">
                  ${observations
                    .map(
                      (item: any) => `
                        <div style="margin-bottom:16px;padding:22px;border-radius:20px;background:#F9FBFC;border:1px solid #E4EAF0;">
                          <div style="font-size:19px;line-height:1.35;font-weight:800;color:#253457;">
                            ${item.title}
                          </div>

                          <div style="margin-top:12px;font-size:15px;line-height:1.8;color:#667085;">
                            ${item.text}
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </div>

              <div style="margin-top:34px;padding:24px;border-radius:22px;background:#F8FAFC;border:1px solid #E5E7EB;">
                <div style="font-size:22px;font-weight:900;color:#253457;letter-spacing:-0.5px;">
                  Hvorfor kan det være vigtigt?
                </div>

                <p style="margin-top:16px;font-size:16px;line-height:1.9;color:#475467;">
                  Mange opdager først problemer med arv, pension eller begunstigelser,
                  når situationen allerede er opstået.
                </p>

                <p style="margin-top:14px;font-size:16px;line-height:1.9;color:#475467;">
                  Hvis dokumenter eller begunstigelser ikke er opdateret, kan værdier,
                  pensioner eller forsikringer ende anderledes end forventet — og
                  dine nærmeste kan få vanskeligere ved at handle på dine vegne.
                </p>
              </div>

              <div style="margin-top:36px;text-align:center;">
                <a
                  href="https://raadgiverxperten.dk"
                  style="display:inline-block;background:#253457;color:white;text-decoration:none;padding:16px 28px;border-radius:999px;font-size:15px;font-weight:800;"
                >
                  Læs mere hos RådgiverXperten
                </a>
              </div>

              <div style="margin-top:40px;padding-top:24px;border-top:1px solid #E5E7EB;">
                <p style="font-size:13px;line-height:1.8;color:#98A2B3;">
                  Resultatet er vejledende og udgør ikke juridisk, finansiel
                  eller investeringsmæssig rådgivning.
                </p>

                <p style="margin-top:18px;font-size:14px;color:#667085;">
                  Venlig hilsen<br/>
                  RådgiverXperten
                </p>
              </div>

            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead API error:", error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}