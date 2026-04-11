
interface EmailRequest {
  to: string;
  subject: string;
  text: string;
  attachment?: {
    filename: string;
    path : string;
  }
}

export default EmailRequest;