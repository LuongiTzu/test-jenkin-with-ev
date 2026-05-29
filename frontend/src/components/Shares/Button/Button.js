import styles from "./Button.module.css";

function Button({
  text = false,
  primary = false,
  blackoutline = false,
  order = false,
  small = false,
  white = false,
  change = false,
  icon = false,
  outline = false,
  type = "button",
  className = "",
  onClick,
  children,
  ...rest
}) {
  let classes = styles.wrapper;
  
  // SỬA: Dùng if-else hoặc switch để tránh xung đột classes
  if (primary) {
    classes += ` ${styles.primary}`;
  } else if (text) {
    classes += ` ${styles.text}`;
  } else if (blackoutline) {
    classes += ` ${styles.blackoutline}`;
  } else if (outline) {
    classes += ` ${styles.outline}`;
  }

  // Các class bổ sung có thể dùng cùng nhau
  if (small) {
    classes += ` ${styles.small}`;
  }
  if (order) {
    classes += ` ${styles.order}`;
  }
  if (white) {
    classes += ` ${styles.white}`;
  }
  if (change) {
    classes += ` ${styles.change}`;
  }
  if (icon) {
    classes += ` ${styles.icon}`;
  }

  // Thêm className từ bên ngoài
  if (className) {
    classes += ` ${className}`;
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;