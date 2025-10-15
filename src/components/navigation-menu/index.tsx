import { NavLink } from 'react-router';
import cn from 'classnames';

import { navItems } from './constants';

import styles from './styles.module.css';

export const NavigationMenu = () => {
  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) => cn(styles.item, { [styles.active]: isActive })}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};
