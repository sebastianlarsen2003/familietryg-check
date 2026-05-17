import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lead, result, observations } = body;

    if (!lead?.name || !lead?.email) {
      return NextResponse.json({ error: "Missing lead data" }, { status: 400 });
    }

    const observationCards = observations
      .map(
        (item: any, index: number) => `
          <tr>
            <td style="padding:0 0 12px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E5EAF0;border-radius:16px;">
                <tr>
                  <td style="padding:16px;">
                    <div style="font-size:12px;font-weight:800;color:#4FB7E7;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">
                      Fokusområde ${index + 1}
                    </div>
                    <div style="font-size:17px;line-height:1.35;font-weight:800;color:#253457;">
                      ${item.title}
                    </div>
                    <div style="font-size:14px;line-height:1.65;color:#667085;margin-top:8px;">
                      ${item.text}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `
      )
      .join("");

    await resend.emails.send({
      from: "FamilieTryg by RådgiverXperten <info@raadgiverxperten.dk>",
      to: [lead.email],
      subject: "Dit FamilieTryg-overblik er klar",
      html: `
        <div style="margin:0;padding:0;background:#F4FAFA;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4FAFA;">
            <tr>
              <td align="center" style="padding:18px 10px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:22px;border:1px solid #E7EEF2;overflow:hidden;">
                  
                  <tr>
                    <td style="padding:24px 18px 8px 18px;">
                      <div style="font-size:12px;font-weight:900;letter-spacing:2px;color:#4FB7E7;text-transform:uppercase;">
                        FamilieTryg
                      </div>
                      <div style="font-size:11px;color:#98A2B3;margin-top:5px;font-weight:700;">
                        by RådgiverXperten
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 18px 20px 18px;">
                      <h1 style="margin:0;font-size:30px;line-height:1.08;color:#253457;font-weight:900;letter-spacing:-1.2px;">
                        Dit fulde FamilieTryg-overblik
                      </h1>

                      <p style="margin:18px 0 0 0;font-size:15px;line-height:1.65;color:#475467;">
                        Hej ${lead.name},<br/><br/>
                        Tak fordi du gennemførte FamilieTryg Tjek. Her får du en mere samlet og uddybende opsummering end den korte visning på siden.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 18px 18px 18px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7F7;border:1px solid #F3C7C7;border-radius:18px;">
                        <tr>
                          <td style="padding:18px;">
                            <div style="font-size:12px;font-weight:900;color:#B42318;letter-spacing:1px;text-transform:uppercase;">
                              Samlet vurdering
                            </div>
                            <div style="font-size:28px;line-height:1.1;font-weight:900;color:#253457;margin-top:8px;">
                              ${result}
                            </div>
                            <p style="font-size:14px;line-height:1.7;color:#475467;margin:14px 0 0 0;">
                              Vurderingen er baseret på dine svar om familieforhold, arv, begunstigelser, fuldmagter og økonomiske forhold.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:2px 18px 18px 18px;">
                      <h2 style="font-size:21px;line-height:1.2;color:#253457;margin:0 0 12px 0;font-weight:900;">
                        Hvorfor kan det have betydning?
                      </h2>
                      <p style="font-size:14px;line-height:1.75;color:#667085;margin:0;">
                        Hvis arv, pension, forsikringer eller fuldmagter ikke er opdateret, kan det betyde, at værdier ender anderledes end forventet. Det kan også gøre det mere besværligt for dine nærmeste at hjælpe dig, hvis du ikke selv kan handle.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 18px 8px 18px;">
                      <h2 style="font-size:21px;line-height:1.2;color:#253457;margin:0 0 14px 0;font-weight:900;">
                        Dine markerede fokusområder
                      </h2>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${observationCards}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 18px 18px 18px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E5EAF0;border-radius:16px;">
                        <tr>
                          <td style="padding:16px;">
                            <div style="font-size:18px;font-weight:900;color:#253457;margin-bottom:10px;">
                              Næste skridt
                            </div>
                            <div style="font-size:14px;line-height:1.8;color:#667085;">
                              1. Tjek hvem der står som begunstiget på pension og forsikring.<br/>
                              2. Overvej om testamente og fremtidsfuldmagt stadig passer til din situation.<br/>
                              3. Få gennemgået forholdene, hvis der er samlever, særbørn, skilsmisse, virksomhed eller ældre dokumenter.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:4px 18px 22px 18px;">
                      <a href="https://raadgiverxperten.dk" style="display:block;text-align:center;background:#253457;color:#ffffff;text-decoration:none;border-radius:999px;padding:15px 18px;font-size:14px;font-weight:900;">
                        Få hjælp til næste skridt
                      </a>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:18px;border-top:1px solid #E5EAF0;">
                      <p style="font-size:12px;line-height:1.7;color:#98A2B3;margin:0;">
                        FamilieTryg Tjek er vejledende og udgør ikke juridisk, finansiel eller investeringsmæssig rådgivning. Resultatet er baseret på de svar, du har afgivet.
                      </p>

                      <p style="font-size:13px;line-height:1.6;color:#667085;margin:16px 0 0 0;">
                        Venlig hilsen<br/>
                        RådgiverXperten
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
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