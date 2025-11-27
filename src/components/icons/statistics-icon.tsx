import { SvgIcon, SVGIconType } from '../svg-icon';

export const StatisticsIcon = ({ size = 24, ...props }: SVGIconType) => {
  return (
    <SvgIcon size={size} viewBox=" 0 0 24 24" stroke="3" {...props}>
      <path
        d="M21 10C21 6.13401 17.866 3 14 3V10H21Z"
        stroke="currentColor"
        fill="currentColor"
      ></path>
      <path
        d="M11 21C15.4183 21 19 17.4183 19 13H11V5C6.58172 5 3 8.58172 3 13C3 17.4183 6.58172 21 11 21Z"
        stroke="currentColor"
        fill="currentColor"
      ></path>
    </SvgIcon>
  );
};
