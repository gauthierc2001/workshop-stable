# KuboNet Workshop

An immersive 3D workshop experience showcasing the KuboNet Robotics Internet Protocol. Built with Next.js, React Three Fiber, and Three.js.

## ✨ Features

- **Interactive 3D Environment**: Explore a detailed workshop with ambient lighting and neon effects
- **Immersive Audio**: Ambient soundscape with interactive click feedback
- **Responsive Design**: Optimized for all screen sizes and devices
- **Desktop Interface**: Clickable icons with popup windows for documentation and project info
- **Professional Documentation**: Complete KuboNet whitepaper with responsive formatting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/kubonet-workshop)

### Manual Deploy

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts** - Vercel will automatically detect Next.js configuration

## 📁 Project Structure

```
workshop-stable/
├── public/
│   ├── images/          # UI images and textures
│   ├── models/workshop/ # 3D model and textures (118 files)
│   └── sound/          # Audio files
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   └── utils/          # Utility functions
└── ...config files
```

## 🎮 How to Use

1. **Explore the Workshop**: Use mouse to look around the 3D environment
2. **Zoom to Computer**: Click on the computer screen to zoom in
3. **Desktop Interface**: Click on the desktop icons:
   - **X**: Opens KuboNet Twitter
   - **GitHub**: GitHub link (placeholder)
   - **Docs**: View the complete KuboNet whitepaper
   - **Kubo v1**: "Coming Soon" preview
4. **Return**: Use the back arrow to return to overview

## 🔧 Technical Details

- **Framework**: Next.js 14 with App Router
- **3D Rendering**: React Three Fiber + Three.js
- **Styling**: Tailwind CSS
- **Audio**: HTML5 Audio API
- **TypeScript**: Full type safety
- **Responsive**: Viewport-based units for true responsiveness

## 🎨 Assets

- **3D Model**: High-quality workshop scene with PBR textures
- **Audio**: Ambient workshop sounds and UI feedback
- **Images**: Custom UI graphics and branding

## 📱 Browser Support

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## 🛠️ Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

No environment variables required for basic functionality.

## 📄 License

This project showcases KuboNet technology. See individual asset licenses in `/public/models/workshop/license.txt`.

## 🤝 Contributing

This is a showcase project. For KuboNet protocol contributions, visit the main KuboNet repository.

---

**KuboNet** - The Robotics Internet Protocol