import Link from "next/link";
import styles from "../styles/Error.module.css";
import { NextSeo } from "next-seo";

const Error = () => {
  return (
    <>
      <NextSeo title="404" canonical="https://phamthanhnam.com/404" />
      <div style={{ textAlign: "center", marginTop: "20vh" }}>
        <div className={styles.errorText}>
          <p className={styles.errorTitle}>
            Oops! It looks like <br />
            .you&apos;re lost
          </p>
          <p className={styles.errorSms}>
            .The page you&apos;re looking for isn&apos;t available. Try to
            search again or use the go to
          </p>
          <Link href="/">
            <button>HOME PAGE</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Error;
