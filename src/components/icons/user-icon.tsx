import { SvgIcon, SVGIconType } from '../svg-icon';

export const UserIcon = ({ size = 32, ...props }: SVGIconType) => {
  return (
    <SvgIcon size={size} viewBox=" 0 0 24 24" stroke="3" color="currentColor" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </SvgIcon>
  );
};
