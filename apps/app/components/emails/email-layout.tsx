import type { ReactNode } from "react";

interface EmailLayoutProps {
  previewText?: string;
  children: ReactNode;
}

export const EmailLayout = ({ previewText, children }: EmailLayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>Simplist</title>
        <style>{`
          @import url('https://rsms.me/inter/inter.css');

          * {
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: transparent;
          }

          .email-content {
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 48px;
            margin: 40px 20px 20px;
          }

          @media (prefers-color-scheme: dark) {
            body {
              background-color: #0a0a0a !important;
            }

            .email-content {
              background-color: #0f0f0f !important;
              border: 1px solid #1a1a1a !important;
            }
          }

          .logo {
            margin-bottom: 48px;
          }

          .logo img {
            height: 28px;
            width: auto;
            display: block;
          }

          .logo-dark {
            display: none !important;
          }

          .logo-light {
            display: block !important;
          }

          @media (prefers-color-scheme: dark) {
            .logo-dark {
              display: block !important;
            }

            .logo-light {
              display: none !important;
            }
          }

          .content {
            color: #ffffff;
            font-size: 15px;
            line-height: 1.7;
          }

          .button {
            display: inline-block;
            background-color: #171717;
            color: #ffffff;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            margin: 32px 0;
            transition: all 0.15s ease;
          }

          .button:hover {
            background-color: #262626;
          }

          @media (prefers-color-scheme: dark) {
            .button {
              background-color: #f5f5f5 !important;
              color: #171717 !important;
            }

            .button:hover {
              background-color: #e5e5e5 !important;
            }
          }

          .footer {
            text-align: center;
            color: #737373;
            font-size: 12px;
            padding: 32px 20px 40px;
            line-height: 1.6;
          }

          .footer-link {
            color: #737373;
            text-decoration: none;
            margin: 0 12px;
            transition: color 0.15s ease;
          }

          .footer-link:hover {
            color: #a3a3a3;
          }

          .divider {
            height: 1px;
            background-color: #e5e5e5;
            margin: 40px 0;
            border: none;
          }

          @media (prefers-color-scheme: dark) {
            .divider {
              background-color: #1a1a1a !important;
            }
          }

          h1 {
            color: #171717;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 24px 0;
            letter-spacing: -0.02em;
            line-height: 1.3;
          }

          h2 {
            color: #171717;
            font-size: 18px;
            font-weight: 600;
            margin: 32px 0 16px 0;
            letter-spacing: -0.01em;
          }

          p {
            margin: 0 0 20px 0;
            color: #525252;
          }

          @media (prefers-color-scheme: dark) {
            h1, h2 {
              color: #ffffff !important;
            }

            p {
              color: #a3a3a3 !important;
            }
          }

          .highlight {
            background-color: #fef9e7;
            border: 1px solid #fde68a;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }

          .highlight p {
            margin: 0;
            color: #525252;
          }

          .info-box {
            background-color: #f5f5f5;
            border: 1px solid #e5e5e5;
            padding: 16px 20px;
            border-radius: 6px;
            margin: 24px 0;
          }

          .info-box p {
            margin: 0;
            color: #525252;
            font-size: 14px;
          }

          @media (prefers-color-scheme: dark) {
            .highlight {
              background-color: rgba(251, 191, 36, 0.05) !important;
              border: 1px solid rgba(251, 191, 36, 0.15) !important;
            }

            .highlight p {
              color: #d4d4d4 !important;
            }

            .info-box {
              background-color: #171717 !important;
              border: 1px solid #262626 !important;
            }

            .info-box p {
              color: #a3a3a3 !important;
            }
          }

          code {
            background-color: #f5f5f5;
            border: 1px solid #e5e5e5;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            color: #d97706;
          }

          a {
            color: #d97706;
            text-decoration: none;
            transition: color 0.15s ease;
          }

          a:hover {
            color: #b45309;
          }

          strong {
            font-weight: 600;
            color: #171717;
          }

          @media (prefers-color-scheme: dark) {
            code {
              background-color: #171717 !important;
              border: 1px solid #262626 !important;
              color: #fbbf24 !important;
            }

            a {
              color: #fbbf24 !important;
            }

            a:hover {
              color: #f59e0b !important;
            }

            strong {
              color: #ffffff !important;
            }
          }

          .feature-list {
            margin: 24px 0;
          }

          .feature-item {
            margin-bottom: 20px;
          }

          .feature-item:last-child {
            margin-bottom: 0;
          }

          .muted {
            color: #737373;
            font-size: 14px;
          }
        `}</style>
      </head>
      <body>
        {previewText && (
          <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>
            {previewText}
          </div>
        )}

        <table
          className="email-container"
          role="presentation"
          cellPadding="0"
          cellSpacing="0"
          style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "40px 20px 20px" }}>
                <div className="logo">
                  <img
                    src="https://cdn.simplist.blog/assets/simplist-text-icon.svg"
                    alt="Simplist"
                    className="logo-light"
                    style={{ height: "28px", width: "auto", display: "block" }}
                  />
                  <img
                    src="https://cdn.simplist.blog/assets/simplist-text-icon-light.svg"
                    alt="Simplist"
                    className="logo-dark"
                    style={{ height: "28px", width: "auto", display: "none" }}
                  />
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <div className="email-content">
                  <div className="content">{children}</div>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <div className="footer">
                  <p style={{ margin: "0 0 12px 0" }}>
                    © {new Date().getFullYear()} Simplist. All rights reserved.
                  </p>
                  <p style={{ margin: "0" }}>
                    <a href="https://simplist.blog" className="footer-link">
                      Website
                    </a>
                    <a
                      href="https://simplist.blog/pricing"
                      className="footer-link"
                    >
                      Pricing
                    </a>
                    <a
                      href="https://simplist.blog/legal/privacy"
                      className="footer-link"
                    >
                      Privacy
                    </a>
                    <a
                      href="https://simplist.blog/legal/terms"
                      className="footer-link"
                    >
                      Terms
                    </a>
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
};
