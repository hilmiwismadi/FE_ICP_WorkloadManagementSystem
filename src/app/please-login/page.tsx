import Link from "next/link";

export default function PleaseLoginPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "20%" }}>
      <h1>Please Login First</h1>
      <p>You need to log in to access this page.</p>
      <Link href="/" passHref>
        <span style={{ textDecoration: "underline", color: "blue" }}>Go to Login</span>
      </Link>
    </div>
  );
}
