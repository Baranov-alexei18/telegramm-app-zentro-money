import { CSSProperties, FC, SVGProps } from 'react';

export type SVGIconType = Partial<{
  height: number;
  width: number;
  size: number;
  color: string;
  viewBox: string;
}>;

type Props = SVGProps<SVGSVGElement> & SVGIconType;

export const SvgIcon: FC<Props> = ({
  children,
  color,
  size = 20,
  height,
  width,
  style = {},
  viewBox,
  ...props
}) => {
  const styles: CSSProperties = {
    width: width || size,
    height: height || size,
    display: 'inline-block',
    userSelect: 'none',
    margin: '0 auto',
    fill: color,
    color,
    ...style,
  };

  return (
    <svg viewBox={viewBox} style={styles} xmlns="https://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
};
