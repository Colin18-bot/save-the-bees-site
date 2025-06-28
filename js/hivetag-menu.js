/* Dashboard Navigation Menu */
#member-navbar {
  background-color: #111;
  padding: 0;
  margin: 0;
}

.member-nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.member-nav-menu > li {
  position: relative;
  flex: 1 1 auto;
}

.dropdown-toggle {
  background-color: #111;
  color: #fff;
  font-weight: bold;
  padding: 1rem;
  cursor: pointer;
  border: none;
  text-align: center;
  width: 100%;
  font-size: 1rem;
}

.dropdown-toggle:hover {
  background-color: #222;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #222;
  width: 100%;
  z-index: 999;
}

.dropdown-menu li {
  text-align: center;
}

.dropdown-menu a {
  display: block;
  color: gold;
  text-decoration: none;
  padding: 0.75rem;
}

.dropdown-menu a:hover {
  background-color: #333;
}

/* Show dropdown on hover for desktop */
@media (min-width: 768px) {
  .dropdown:hover .dropdown-menu {
    display: block;
  }
}

/* Mobile layout */
@media (max-width: 767px) {
  .member-nav-menu {
    flex-direction: column;
  }
}
