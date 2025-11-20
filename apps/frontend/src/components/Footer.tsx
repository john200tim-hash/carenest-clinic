const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>&copy; {currentYear} Captimed Clinic. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
