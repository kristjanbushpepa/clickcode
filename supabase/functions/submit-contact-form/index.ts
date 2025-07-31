import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  restaurantName: string;
  budget: string;
  numberOfTables: string;
  currentMenuType: string;
  features: string[];
  additionalInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const formData: ContactFormData = await req.json();
    console.log("Received contact form submission:", formData);

    // Insert into database
    const { data: submissionData, error: insertError } = await supabase
      .from("contact_submissions")
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        restaurant_name: formData.restaurantName,
        budget: formData.budget,
        number_of_tables: formData.numberOfTables,
        current_menu_type: formData.currentMenuType,
        features: formData.features,
        additional_info: formData.additionalInfo,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save contact submission");
    }

    console.log("Contact submission saved:", submissionData);

    // Get company email from settings
    const { data: companySettings, error: settingsError } = await supabase
      .from("company_settings")
      .select("contact_email")
      .single();

    if (settingsError || !companySettings?.contact_email) {
      console.error("Error fetching company settings:", settingsError);
      throw new Error("Company contact email not configured");
    }

    // Send email notification using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
      <p><strong>Restaurant Name:</strong> ${formData.restaurantName}</p>
      <p><strong>Budget:</strong> ${formData.budget}</p>
      <p><strong>Number of Tables:</strong> ${formData.numberOfTables}</p>
      <p><strong>Current Menu Type:</strong> ${formData.currentMenuType}</p>
      <p><strong>Desired Features:</strong> ${formData.features.join(', ') || 'None specified'}</p>
      <p><strong>Additional Information:</strong> ${formData.additionalInfo || 'None provided'}</p>
      <hr>
      <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: [companySettings.contact_email],
      subject: `New Contact Form Submission from ${formData.name}`,
      html: emailContent,
      reply_to: formData.email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact form submitted successfully",
        submissionId: submissionData.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in submit-contact-form function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);