import { Link } from "react-router";
import styles from "./LinkButton.module.css";
function LinkButton({
  to,
  text = false,
  primary = false,
  outline = false,
  oulineBlack = false,
  black = false,
  children,
}) {
  var classes = styles.wrapper;
  if (primary) {
    classes += ` ${styles.primary}`;
  }
  if (text) {
    classes += ` ${styles.text}`;
  }
  if (outline) {
    classes += ` ${styles.outline}`;
  }
  if (oulineBlack) {
    classes += ` ${styles.oulineBlack}`;
  }
  if (black) {
    classes += ` ${styles.black}`;
  }
  return (
    <Link className={classes} to={to}>
      {children}
    </Link>
  );
}
export default LinkButton;
