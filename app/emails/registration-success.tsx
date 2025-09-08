import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components"

interface RegistrationSuccessEmailProps {
  name: string
  registrationCode: string
  profileUrl: string
}

export default function RegistrationSuccessEmail({
  name,
  registrationCode,
  profileUrl,
}: RegistrationSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the contest! Your registration is complete.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Registration Successful!</Heading>

          <Text style={text}>Hi {name},</Text>

          <Text style={text}>Congratulations! Your registration for the 7for7 contest has been successfully completed.</Text>

          <Section style={codeContainer}>
            <Text style={codeLabel}>Your Registration Code:</Text>
            <Text style={code}>{registrationCode}</Text>
          </Section>

          <Text style={text}>You can view and manage your contestant profile using the link below:</Text>

     <Section style={{ margin: "30px 0", textAlign: "center" }}>
  <table
    role="presentation"
    cellPadding="0"
    cellSpacing="0"
    border={0}
    width="100%"
    style={{ textAlign: "center" }}
  >
    <tr>
      <td align="center" style={{ padding: "0 10px" }}>
        <Link href={profileUrl} style={button}>
          View My Profile
        </Link>
      </td>
      <td align="center" style={{ padding: "0 10px" }}>
        <Link
          href="https://voting.pharoahshoundtattoostudios.com/votes/"
          style={button}
        >
          Click here to vote
        </Link>
      </td>
    </tr>
  </table>
</Section>


          <Text style={text}>
            Keep your registration code safe, it serves as your password when logging in with the email you used to register.
Share this code with family and friends so they can vote for you during the contest!
          </Text>

          <Text style={footer}>
            Good luck in the contest! For any complaints or enquiry feel free to contat us via our social handles or you can send an email to inquiries@pharoahshoundtattoostudios.com.
            <br />
            Pharoahs Hound Tattoo Studios.
                    </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#000000",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
}

const container = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #333333",
  borderRadius: "8px",
  margin: "40px auto",
  padding: "40px",
  width: "600px",
}

const h1 = {
  color: "#8BC34A",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 30px",
  textAlign: "center" as const,
}

const text = {
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px",
}

const codeContainer = {
  backgroundColor: "#2a2a2a",
  border: "1px solid #444444",
  borderRadius: "8px",
  margin: "30px 0",
  padding: "20px",
  textAlign: "center" as const,
}

const codeLabel = {
  color: "#C0A000",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 10px",
}

const code = {
  color: "#8BC34A",
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "2px",
  margin: "0",
}

// const buttonContainer = {
//   margin: "30px 0",
//   textAlign: "center" as const,
// }

const button = {
  backgroundColor: "#8BC34A",
  borderRadius: "8px",
  color: "#000000",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none",
}

const footer = {
  color: "#888888",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "30px 0 0",
  textAlign: "center" as const,
}
