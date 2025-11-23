# Background Images for Campus Haiti

## Hero Background Image

### Current Setup
The homepage uses a hero section with a background image located at:
- **Path**: `/public/images/haiti-hero-bg.jpg`
- **Recommended size**: 1920x1080 pixels (Full HD) or higher
- **Format**: JPG or WebP (for better performance)
- **File size**: Aim for under 500KB (use image optimization)

### Recommended Haitian Landmarks/Landscapes

#### **Top Choices:**

1. **Citadelle Laferrière** 🏰
   - Iconic UNESCO World Heritage fortress
   - Dramatic mountain setting
   - Perfect for showing Haiti's history and strength
   - Best angle: From below showing fortress against sky

2. **Labadee/Labadie Beach** 🏖️
   - Beautiful turquoise Caribbean waters
   - Represents Haiti's natural beauty
   - Welcoming, aspirational feel
   - Best angle: Beach with mountains in background

3. **Bassin Bleu** 💧
   - Natural turquoise pools and waterfalls
   - Unique to Haiti
   - Refreshing, natural beauty
   - Best angle: Waterfall cascading into pool

4. **Sans-Souci Palace** 🏛️
   - Historic royal palace ruins
   - Shows Haitian heritage
   - Architectural beauty
   - Best angle: Front facade with mountain backdrop

5. **Port-au-Prince Panorama** 🌆
   - Modern Haiti
   - City life and mountains
   - Shows educational landscape
   - Best angle: Sunset over city with mountains

6. **National Pantheon Museum (MUPANAH)** 🏛️
   - Beautiful neoclassical architecture
   - Cultural heritage
   - Best angle: Front entrance

### Where to Find Images

#### Free Stock Photo Sites (CC0/Royalty-Free):
- **Unsplash**: Search "Haiti"
- **Pexels**: Search "Haiti landscape"
- **Pixabay**: Search "Haiti beach" or "Haiti mountain"
- **Wikimedia Commons**: Search "Haiti landmarks"

#### Premium Stock Photo Sites:
- **Getty Images**: High-quality professional photos
- **Shutterstock**: Wide selection
- **Adobe Stock**: Professional travel photography

#### Tips for Selecting:
1. ✅ High resolution (at least 1920x1080px)
2. ✅ Landscape orientation (horizontal)
3. ✅ Clear focal point
4. ✅ Good contrast (works well with text overlay)
5. ✅ Represents Haiti positively and authentically
6. ✅ Not too busy (text needs to be readable)

### Image Optimization

Before uploading, optimize your image:

**Using Online Tools:**
- **TinyPNG**: https://tinypng.com (recommended)
- **Squoosh**: https://squoosh.app (Google tool)
- **ImageOptim**: https://imageoptim.com (Mac)

**Target Specifications:**
- Format: JPG (or WebP for better compression)
- Size: 1920x1080px or 2560x1440px
- File size: Under 500KB
- Quality: 80-85%

### How to Add Your Image

1. **Download your chosen image**
2. **Optimize it** using tools above
3. **Rename it to**: `haiti-hero-bg.jpg`
4. **Place it in**: `/public/images/` folder
5. **Done!** The homepage will automatically use it

### Alternative: Using a Video Background

If you want to use a video instead:

1. **Get a short video** (10-30 seconds, looping)
2. **Optimize it**: MP4 format, H.264 codec, under 5MB
3. **Save as**: `/public/videos/haiti-hero-bg.mp4`
4. **Update** `/app/[locale]/page.tsx`:

```tsx
{/* Replace Image component with video */}
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/videos/haiti-hero-bg.mp4" type="video/mp4" />
</video>
```

### Current Design Features

The hero section includes:
- ✅ Full-width responsive background
- ✅ Gradient overlay for text readability (black 50-70% opacity)
- ✅ White text with drop shadow
- ✅ Mobile-friendly layout
- ✅ Next.js Image optimization
- ✅ Smooth hover effects on buttons

### Need Help?

Contact the development team if you need assistance with:
- Image selection
- Image optimization
- Custom sizing or cropping
- Video background implementation
