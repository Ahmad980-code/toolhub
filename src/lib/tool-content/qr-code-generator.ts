import type { Tool } from "../tools";

export const qrCodeGenerator: Tool = {
  slug: "qr-code-generator",
  name: "QR Code Generator",
  category: "converters",
  icon: "QrCode",
  summary: "Free QR codes for links, Wi-Fi, WhatsApp, email and more.",
  title: "QR Code Generator – Free for Links, Wi-Fi & WhatsApp",
  description:
    "Create free QR codes for websites, Wi-Fi, WhatsApp, phone, email and SMS. Custom colours, PNG and SVG downloads, no sign-up and codes never expire.",
  intro:
    "Make a QR code for a website link, plain text, Wi-Fi network, phone number, email, SMS or WhatsApp chat in seconds. Choose the size, colours, margin and error-correction level, then download a high-resolution PNG or a scalable SVG that stays sharp in print. Everything is generated in your browser: the code contains only the data you enter, nothing is uploaded or redirected through a server, and the code never expires.",
  steps: [
    "Choose what the code should do: open a link, join a Wi-Fi network, start a WhatsApp chat and so on.",
    "Fill in the details; the preview updates as you type.",
    "Adjust the size, colours, margin and error correction if you like.",
    "Download the PNG or SVG (or copy the image) and test it with your phone camera before you print.",
  ],
  faqs: [
    {
      q: "Do these QR codes expire, and is my data private?",
      a: "They never expire. These are static QR codes: the link or text is stored inside the code itself, not on a server, so the code keeps working for as long as its content is valid. The code is generated in your browser, so details such as your Wi-Fi password are never uploaded. If a website address changes later, make a new code.",
    },
    {
      q: "How do I make a QR code for my Wi-Fi?",
      a: "Choose Wi-Fi, then enter the network name (SSID) exactly as it appears on your devices, the password and the security type. Almost all home routers use WPA, WPA2 or WPA3. The code uses the standard WIFI:T:WPA;S:name;P:password;; format, which the camera apps on iPhone and Android read to join the network in one tap. Special characters such as ; , : and \\ are escaped for you.",
    },
    {
      q: "How do I create a WhatsApp QR code?",
      a: "Choose WhatsApp and enter the phone number in international format without the + or leading zeros, for example 923001234567 for the Pakistani mobile number 0300 1234567. You can add a message that will be pre-filled in the chat. The code opens a https://wa.me/ link, which starts the chat in the WhatsApp app or on WhatsApp Web.",
    },
    {
      q: "Which error correction level should I choose?",
      a: "Error correction lets a code scan even when part of it is dirty, scratched or covered. Level L can recover about 7% of the code, M about 15%, Q about 25% and H about 30%. Higher levels add more modules, making the code denser. M is a good default for screens and clean prints; choose Q or H for stickers, outdoor signs or if you plan to place a small logo over the middle.",
    },
    {
      q: "What size should a printed QR code be, and can I change its colours?",
      a: "A common rule of thumb is that the code should be at least one tenth of the scanning distance and never smaller than about 2 × 2 cm (0.8 in), so a poster read from 2 metres away needs a code of about 20 cm. Use the SVG download for print. Custom colours work if you keep a dark foreground on a light background with strong contrast and leave the 4-module quiet zone around the code; many scanners cannot read inverted (light on dark) or low-contrast codes, and the tool warns you about both.",
    },
  ],
};
