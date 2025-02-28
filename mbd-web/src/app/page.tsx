import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>My Belly&apos;s Diary</h1>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
