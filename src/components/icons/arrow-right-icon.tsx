import { SvgIcon, SVGIconType } from '../svg-icon';

export const ArrowRightIcon = ({ size = 24, ...props }: SVGIconType) => {
  return (
    <SvgIcon size={size} viewBox=" 0 0 24 24" stroke="3" {...props}>
      <path
        d="M17.6492 11.2501L12.7904 6.53852L13.8346 5.46167L20.5774 12.0001L13.8346 18.5385L12.7904 17.4617L17.6492 12.7501H3V11.2501H17.6492Z"
        fill="currentColor"
      ></path>
    </SvgIcon>
  );
};
