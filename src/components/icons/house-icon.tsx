import { SvgIcon, SVGIconType } from '../svg-icon';

export const HouseIcon = ({ size = 32, ...props }: SVGIconType) => {
  return (
    <SvgIcon size={size} viewBox=" 0 0 32 32" stroke="3" {...props}>
      <path
        d="M3 12L12 3l9 9v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9z"
        fill="none"
        color="currentColor"
      />
    </SvgIcon>
  );
};
