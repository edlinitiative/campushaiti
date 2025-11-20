# Live Chat Setup Instructions

The Campus Haiti platform includes a live chat widget powered by Tawk.to.

## Current Status

The live chat is configured with demo credentials. To enable live chat for your organization:

## Setup Steps

### 1. Create a Tawk.to Account

1. Visit [https://www.tawk.to/](https://www.tawk.to/)
2. Sign up for a free account
3. Create a new property for Campus Haiti

### 2. Get Your Credentials

1. Log in to your Tawk.to dashboard
2. Go to **Administration** → **Channels** → **Chat Widget**
3. Find your embed code that looks like:
   ```html
   <script type="text/javascript">
   var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
   (function(){
   var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
   s1.async=true;
   s1.src='https://embed.tawk.to/PROPERTY_ID/WIDGET_ID';
   ...
   ```
4. Copy your `PROPERTY_ID` and `WIDGET_ID` from the URL

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_TAWK_PROPERTY_ID=your_property_id_here
NEXT_PUBLIC_TAWK_WIDGET_ID=your_widget_id_here
```

### 4. Restart Development Server

```bash
npm run dev
```

## Features

- **Automatic Widget**: Chat widget appears on all pages
- **Chat Button**: Help page includes a dedicated "Start Chat" button
- **Multi-language Support**: Configure widget language in Tawk.to dashboard
- **Mobile Responsive**: Works on all device sizes
- **Customizable**: Customize colors, position, and behavior in Tawk.to dashboard

## Customization

### Widget Position

In your Tawk.to dashboard:
1. Go to **Administration** → **Channels** → **Chat Widget**
2. Click **Widget Appearance**
3. Choose position (bottom-right, bottom-left, etc.)

### Widget Colors

Match your brand colors:
1. Go to **Widget Appearance**
2. Customize colors to match Campus Haiti branding

### Offline Messages

Configure what happens when agents are offline:
1. Go to **Administration** → **Channels** → **Chat Widget**
2. Configure offline message form and auto-responses

## Alternative Solutions

If you prefer a different live chat solution:

### Intercom
```tsx
// Replace LiveChat component with Intercom
<script>
  window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "YOUR_APP_ID"
  };
</script>
```

### Crisp
```tsx
// Replace with Crisp chat
<script type="text/javascript">
  window.$crisp=[];
  window.CRISP_WEBSITE_ID="YOUR_WEBSITE_ID";
</script>
```

### Zendesk
```tsx
// Replace with Zendesk Widget
<script id="ze-snippet" 
  src="https://static.zdassets.com/ekr/snippet.js?key=YOUR_KEY">
</script>
```

## Testing

1. Open any page on the site
2. Look for the chat widget in the bottom-right corner
3. Click "Start Chat" button on the help page
4. The chat window should open

## Troubleshooting

### Widget not appearing
- Check browser console for errors
- Verify environment variables are set correctly
- Clear browser cache and reload

### Chat button not working
- Ensure Tawk.to script has loaded (check Network tab in DevTools)
- Check `window.Tawk_API` is defined in browser console

### Widget in wrong language
- Configure default language in Tawk.to dashboard under Widget Appearance → Language

## Support

For Tawk.to specific issues, visit their [Help Center](https://help.tawk.to/).
