export type CurverdLineProps = {
  variant?: number;
  className?: string;
};

export const CurverdLine = (props: CurverdLineProps) => {
  if (props.variant === 1) {
    return (
      <svg
        width="294"
        height="33"
        viewBox="0 0 294 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={props.className}
      >
        <path
          d="M2 30.5C2 30.5 11.5871 2 31.5 2C51.4129 2 61.5871 30.5 81.5 30.5C101.413 30.5 111.587 2 131.5 2C151.413 2 161.587 30.5 181.5 30.5C201.413 30.5 198.5 2 231.5 2C264.5 2 292 20 292 20"
          stroke="#00BFA9"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  } else {
    return (
      <svg
        width="172"
        height="113"
        viewBox="0 0 172 113"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={props.className}
      >
        <path
          d="M168.632 3.09252C168.632 3.09252 138.937 7.83677 122.67 17.2167C91.8831 34.9689 38.5738 76.4123 70.3882 91.7007C98.0592 104.998 122.038 77.9609 117.753 55.519C112.801 29.5896 66.0399 56.2708 39.7756 73.1502C15.794 88.5625 3.92194 109.406 3.92194 109.406"
          stroke="#00BFA9"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
};
