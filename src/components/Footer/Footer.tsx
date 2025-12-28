import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer flex flex-col items-center justify-center py-10 gap-6 text-white w-full">
      <h2 className="text-xl font-bold tracking-wide uppercase m-0">
        STUDY VAULT OF UIT
      </h2>

      <div className="footer-links flex gap-10 text-sm font-bold">
        <a 
          href="https://svuit.org/mmtt/" 
          className="text-white no-underline hover:text-[#2C84FA] transition-colors"
          target="_blank" 
          rel="noreferrer"
        >
          Kho tài liệu
        </a>
        <a 
          href="https://svuit.org/mmtt/docs/contribute" 
          className="text-white no-underline hover:text-[#2C84FA] transition-colors"
          target="_blank" 
          rel="noreferrer"
        >
          Đóng góp
        </a>
        <a 
          href="https://svuit.org/mmtt/docs/ThongBao/index" 
          className="text-white no-underline hover:text-[#2C84FA] transition-colors"
          target="_blank" 
          rel="noreferrer"
        >
          Thông báo
        </a>
      </div>

      <div className="footer-icons flex gap-6 items-center">
        {/* Facebook */}
        <a href="https://www.facebook.com/studyvault.uit" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="#2C84FA"
            className="footer-icon-fb"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-3 7h-1.924c-.615 0-1.076.252-1.076.889v1.111h3l-.238 3h-2.762v8h-3v-8h-2v-3h2v-2.284c0-2.475 1.277-3.716 3.719-3.716 1.185 0 2.219.125 2.281.137v2.863z"/>
          </svg>
        </a>

        {/* YouTube */}
        <a href="https://www.youtube.com/@svuit-mmtt" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="#2C84FA"
            className="footer-icon-std"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>

        {/* Email */}
        <a href="mailto:contact@svuit.org" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="#2C84FA"
            className="footer-icon-std"
          >
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </a>
      </div>

      <a 
        href="https://github.com/SVUIT/mmtt/issues/new/choose" 
        className="text-white no-underline font-bold text-sm hover:text-[#2C84FA] transition-colors"
        target="_blank" 
        rel="noreferrer"
      >
        Báo cáo bug tại đây.
      </a>
    </footer>
  );
};

export default Footer;