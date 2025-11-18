import { SvgIcon, SVGIconType } from '../svg-icon';

export const ArrowLeftIcon = ({ size = 24, ...props }: SVGIconType) => {
  return (
    <SvgIcon size={size} viewBox=" 0 0 24 24" stroke="3" {...props}>
      <path
        d="M6.3508 12.7499L11.2096 17.4615L10.1654 18.5383L3.42264 11.9999L10.1654 5.46148L11.2096 6.53833L6.3508 11.2499L21 11.2499L21 12.7499L6.3508 12.7499Z"
        fill="currentColor"
      ></path>
    </SvgIcon>
  );
};
