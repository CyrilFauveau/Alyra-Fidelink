const Footer = () => {
    return (
      <div className="flex justify-center items-center w-full p-5">
          <p>&copy; Tous droits réservés | Fidelink | {new Date().getFullYear()}</p>
      </div>
    );
  }
  
  export default Footer;