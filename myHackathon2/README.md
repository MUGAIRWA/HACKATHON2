# Smart Hub - Educational Support Platform 🎓

**Smart Hub** is a comprehensive web platform that connects students in need with generous donors to provide meal assistance, educational resources, and health support. Built for hackathon submission with real-world functionality.

## 🌟 Features

### For Students
- **Meal Request System**: Request funding for breakfast, lunch, dinner, or snacks
- **AI-Powered Meal Recommendations**: Get personalized meal suggestions based on budget and dietary needs
- **Educational Resources**: Access to study materials and academic support
- **Health & Wellness Tips**: Nutritional guidance and wellness resources
- **Real-time Notifications**: Stay updated on request status and funding

### For Donors/Parents
- **Browse Meal Requests**: View and fund student meal requests
- **Impact Tracking**: See your donation history and impact metrics
- **Smart Matching**: AI-powered matching with students based on school, location, and needs
- **Secure Payment Processing**: Safe and secure donation processing
- **Impact Reports**: Detailed reports on how your donations help students

### For Administrators
- **User Management**: Manage student and donor accounts
- **Request Approval**: Review and approve meal requests
- **Analytics Dashboard**: Track platform usage, donations, and impact
- **Content Management**: Manage educational resources and platform content

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** database with Row Level Security
- **Edge Functions** for serverless API endpoints
- **Real-time subscriptions** for live updates

### AI Integration
- **Custom AI Edge Functions** for meal recommendations
- **Nutritional analysis** and personalized suggestions
- **Smart matching algorithms** for connecting students with donors

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **pnpm**
- **Supabase account** (free tier available)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MUGAIRWA/HACKATHON2.git
cd myHackathon2
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

#### Get Your Supabase Credentials
1. Go to Settings > API
2. Copy your project URL and anon public key

#### Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Database Setup

The database schema will be automatically created when you run the application. It includes:

- **Users/Profiles**: Student, donor, and admin accounts
- **Meal Requests**: Student meal funding requests
- **Donations**: Donor contributions and payments
- **Notifications**: Real-time user notifications

### 5. Run the Development Server
```bash
npm run dev
# or
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

## 🏗️ Project Structure

```
myHackathon2/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Logo.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state management
│   ├── lib/               # Utility libraries
│   │   └── supabase.ts    # Supabase client and helpers
│   ├── pages/             # Main application pages
│   │   ├── Landing.tsx    # Homepage
│   │   ├── Auth.tsx       # Login/Register
│   │   ├── StudentDashboard.tsx
│   │   ├── DonorDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── App.tsx            # Main app component
│   ├── index.tsx          # App entry point
│   └── index.css          # Global styles
├── public/                # Public assets
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🔐 Authentication & Security

### User Roles
- **Student**: Can create meal requests, view recommendations
- **Donor**: Can fund requests, view impact metrics
- **Admin**: Full platform management capabilities

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure user sessions
- **Email Verification**: Account verification process
- **Role-based Access**: Different permissions per user type

## 🤖 AI Features

### Meal Recommendations
The platform includes AI-powered meal recommendations that consider:
- **Budget constraints**
- **Meal type** (breakfast, lunch, dinner, snack)
- **Dietary restrictions** (vegetarian, vegan, allergies)
- **Nutritional needs** for students
- **Local food prices** and availability

### Smart Matching
- **Geographic matching**: Connect students with nearby donors
- **School-based preferences**: Donors can support specific schools
- **Impact optimization**: Maximize the effect of each donation

## 💳 Payment Integration

For production deployment, integrate with:
- **Stripe** for credit card processing
- **PayPal** for alternative payments
- **Apple Pay/Google Pay** for mobile users

*Note: Current implementation uses demo payment flows for development*

## 📊 Analytics & Reporting

### Student Analytics
- Meal request success rates
- Nutritional intake tracking
- Academic performance correlation

### Donor Analytics
- Total donations and impact
- Students helped over time
- Geographic impact distribution

### Platform Analytics
- User growth and engagement
- Request fulfillment rates
- Revenue and sustainability metrics

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Summary of Deployment Options

- **GitHub Pages**: Automated deployment via GitHub Actions or manual deployment of `dist` folder.
- **Vercel**: Connect GitHub repo, set environment variables, auto-deploy on push.
- **Netlify**: Connect GitHub repo, configure build settings, set environment variables.

## ⚡ Real-time Features

For detailed real-time setup, see [realtime-setup-guide.md](./realtime-setup-guide.md).

### Highlights
- Instant notifications and live updates
- Real-time meal request and donation status
- Dynamic dashboards without page refresh

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Profile creation and updates
- [ ] Meal request creation
- [ ] Donation processing
- [ ] Admin dashboard functionality
- [ ] Mobile responsiveness
- [ ] Email notifications

### Automated Testing (Future Enhancement)
- Unit tests with Jest and React Testing Library
- Integration tests for API endpoints
- End-to-end tests with Cypress

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks
- `npm run deploy` - Build and prepare for deployment
- `npm run type-check` - Run TypeScript type checks

## 🛠️ Troubleshooting

### Common Issues

1. **Blank page after deployment**
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Ensure `base: './'` is set in vite.config.ts

2. **Supabase connection errors**
   - Verify Supabase URL and key are correct
   - Check if Supabase project is active
   - Verify RLS policies are set up

3. **404 errors on refresh**
   - Add `_redirects` file to public folder with: `/* /index.html 200`
   - Or configure your hosting provider for SPA routing

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is created for educational purposes and hackathon submission.

## 🏆 Hackathon Submission

### Problem Statement
Many students face food insecurity, which directly impacts their academic performance and overall well-being.

### Solution
Smart Hub creates a bridge between students in need and community members willing to help, using technology to make the process efficient, transparent, and impactful.

### Innovation
- **AI-powered meal recommendations** optimize nutrition within budget constraints
- **Real-time matching** connects students with nearby donors instantly
- **Impact tracking** shows donors the direct effect of their contributions
- **Comprehensive platform** addresses education, health, and nutrition holistically

### Technical Achievement
- Full-stack web application with modern technologies
- Real-time database with complex relationships
- AI integration for personalized recommendations
- Secure authentication and payment processing
- Responsive design for all devices

### Social Impact
- **Immediate**: Students get the meals they need to focus on learning
- **Long-term**: Improved academic outcomes and reduced dropout rates
- **Community**: Stronger connections between community members and schools

## 📞 Contact

For questions about this hackathon project:
- **Student**: Tevin Agala
- **School**: plp academy
- **Email**: agalatevinmugairwa@gmail.com

---

**Smart Hub** - *Connecting communities to support student success* 🌟
