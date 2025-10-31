import Logo from "../assets/restaurant.png";
export default function Header() {
  return (
    <header>
      <img src={Logo} />
      <h1>Chef Claude</h1>
    </header>
  );
}
