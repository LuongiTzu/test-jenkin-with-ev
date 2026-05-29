import { Element } from "react-scroll";
import AboutMe from "./AboutMe/AboutMe";
import Features from "./Features/Features";
import Feedbacks from "./Feedbacks/Feedbacks";
import styles from "./Home.module.css";
import PriceList from "./PriceList/PriceList";
function Home() {
  return <div className={styles.wrapper}>
  <Element name="about-section" className={styles.item}>
        <AboutMe />
      </Element>

      <Features />

      <Element name="price-section"  className={styles.item}>
        <PriceList />
      </Element>

      <Element name="feedback-section"  className={styles.item}>
        <Feedbacks />
      </Element>
  </div>
}
export default Home;
