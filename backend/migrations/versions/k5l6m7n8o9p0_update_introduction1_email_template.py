"""update introduction-1 email template

Revision ID: k5l6m7n8o9p0
Revises: j5k6l7m8n9o0
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'k5l6m7n8o9p0'
down_revision = 'j5k6l7m8n9o0'
branch_labels = None
depends_on = None

# HTML email template content for introduction-1
INTRODUCTION_1_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
  <body style="font-family: Calibri, sans-serif; font-size: 11px; color: #000;">
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:12px; ">
        <strong style="color:#0070C0;">"We give progressive business. Big Automation"</strong><br>
        <strong style="color:#0070C0;">"Automate. Simplify. Grow – Smarter, Affordable ERP with Robotic Process Automation & Artificial Intelligence"</strong>
    </div>
    <div style="margin:8pt 0 0 0; font-family: Calibri, sans-serif; font-size: 11px; line-height: 1.7; color: #000000; padding-top:6px;">
        <strong>Dear [#CONTACT_NAME#],</strong>
    </div>
    <div style="margin:2pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
     Managing trading and operational workflows of industrial products primarily to the oil, gas, and petrochemical industry can be challenging - especially with manual processes and disconnected systems of handling multiple RFQS, Supplier Quotations, Price Comparison, and Customer Quotations. Also handling Customer Orders, Supplier Orders, and deliveries from multiple suppliers.
    </div>
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
      That's where Axiever helps; the software has it all and handles the entire process flawlessly, with a Streamlined Process, Artificial Intelligence, and Robotic Process Automation.
    </div>
    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
     A cloud-based business management software (ERP) platform, designed to help businesses like yours:
    </div>

    <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
      <li>
        <span style="color: #000; ">Automates workflows:</span>
        <div style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
             <div>
                <span style="color: #000; ">- From Customer RFQ to Supplier selection and Inquiry</span>
              </div>
                <div>
                <span style="color: #000; ">- Suppliers' Quotation to Price comparison and Customer Quotation,</span>
              </div>
                <div>
                <span style="color: #000; ">- Customer Order to Supplier Purchase Order</span>
              </div>
                <div>
                <span style="color: #000; ">- Supplier delivery to the customer's warehouse</span>
              </div>
     </div>
      </li>
    </ul>
    <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
      <li>
        <span style="color: #000; ">Streamline across Finance, HR, and Inventory.</span>
      </li>
    </ul>
    <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
      <li>
        <span style="color: #000; ">Simplify compliance and documentation</span>
      </li>
    </ul>
    <ul style="margin: 0pt 0 0 20px; padding: 0; font-family: Calibri, sans-serif; font-size: 11px;">
      <li>
        <span style="color: #000; ">Gain real-time visibility and faster decision-making</span>
      </li>
    </ul>

    <div style="margin:0pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
      Our clients from the same industry typically reduce administrative work by up to 60-70% and see measurable ROI within 3-4 months, with a positive cash flow due to increased efficiency.
    </div>

    <a href="https://www.axiever.com" target="_blank">
              <img src="https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5eOil_Gas-Petroleum_email.jpg" width="50" alt="Oil Gas Petroleum email" style="display: block; border: none; width: 50%;">
      </a>


    <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
      Seeing is believing, we would like you to spare 30 minutes for a call and demo to explore how Axiever could simplify your operations.
    </div>
    <br>
    <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
      Happy to walk you through it.
    </div>
    <div style="margin:0px 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
      Want to see how this works? Click on the links below:
    </div>

    <div class="mlft_10" style=" margin:4px 0 0 0; line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;">
        <a style=" line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;" target="_blank" href="https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5eaxiever-company-profile.pdf">Company Profile</a><br>
        <div>
            <a target="_blank" href="https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5evideo-short-(general).mp4">Axiever Video</a>
        </div>
        <div>
            <a target="_blank" href="https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5evideo-(benefits).mp4">Problems & Solutions Video</a>
        </div>
        <div>
            <a target="_blank" href="https://start.axiever.com/download_aws_file/company-27%5epartnerrequirement%5ePartner-1%5eppt-(problems-and-solutions).pdf">Problems & Solutions Presentation</a>
        </div>
    </div>

      <div style="line-height: 1.3; font-family: Calibri, sans-serif; font-size: 11px;">
        [#DUE_DILIGENCE_LINK#]
        [#ECOMMERCE_QUESTIONNAIRE_LINK#]
        [#ATTACHMENTS#]
      </div>

      <div style="margin:4pt 0 0 0; font-family:Calibri, sans-serif; font-size:11px; ">
        Best regards,<br>
        <strong style="color:#0070C0;">Axiever</strong><br>
        <em style="color:#0070C0;">Smart. Simple. Affordable.</em><br>
        <em style="color:#0070C0;">A Canadian-headquartered company helping businesses grow faster with AI-powered simplicity.</em>
      </div>
      <table style="margin:4px 0 0 0;" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        <tr>
          <td style="border: none; vertical-align: top; border-right: 1.5px solid #0f0f0f; padding-right: 10px;">
            <a href="https://www.axiever.com" target="_blank">
              <img src="https://axiever.com/wp-content/themes/twentytwenty/assets/images/Axiever.png" width="75" alt="Axiever Logo" style="display: block; border: none;">
            </a>
          </td>
          <td style="font-size: 11px; font-family: Calibri, sans-serif; padding-left: 15px;">
            <strong>[#USER_FIRST_NAME#] [#USER_LAST_NAME#]</strong><br>
            <span style="color: #0070C0;">[#USER_TITLE#]</span><br>
            <a href="tel:+19059974044" style="color: #0070C0; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
                +1 (905) 997-4044 ext. [#USER_EXT#]
            </a><br>
            <a href="mailto:[#USER_EMAIL#]" style="color: #0070C0; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Mail Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
                [#USER_EMAIL#]
            </a><br>
            <a href="https://www.axiever.com" style="color: #0070C0; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Website Icon" width="14" style="vertical-align: middle; margin-right: 5px;">
                www.axiever.com
            </a>
          </td>
        </tr>
      </table>

      <div style="margin:10px 0 0 0; font-size:11px; color:#666; padding-top:10px; font-family:Calibri, sans-serif; ">
        <em>This email and any attachments are confidential and may be privileged.
          If you are not the intended recipient, please notify the sender immediately and delete this email.</em>
      </div>
  </body>
</html>'''


def upgrade():
    # Update the introduction-1 email template
    op.execute(f"""
        UPDATE cri_email_templates
        SET email_template = '{INTRODUCTION_1_TEMPLATE.replace("'", "''")}'
        WHERE email_format = 'introduction-1' AND tab = 'Introduction'
    """)

    # If the template doesn't exist, insert it
    op.execute(f"""
        INSERT INTO cri_email_templates (title, tab, email_format, email_format_option_values, subject, email_template)
        SELECT 'Introduction Email 1', 'Introduction', 'introduction-1', 'introduction-1', 'Introduction to Axiever - Cloud ERP Solution', '{INTRODUCTION_1_TEMPLATE.replace("'", "''")}'
        WHERE NOT EXISTS (
            SELECT 1 FROM cri_email_templates WHERE email_format = 'introduction-1' AND tab = 'Introduction'
        )
    """)


def downgrade():
    # Revert to a basic template
    op.execute("""
        UPDATE cri_email_templates
        SET email_template = '<p>Dear [#CONTACT_NAME#],</p><p>Thank you for your interest in our services.</p><p>Best regards</p>'
        WHERE email_format = 'introduction-1' AND tab = 'Introduction'
    """)
