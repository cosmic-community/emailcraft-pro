# EmailCraft Pro

![App Preview](https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&h=300&fit=crop&auto=format)

A comprehensive email marketing platform that rivals Mailchimp in functionality. Create, manage, and execute successful email campaigns with AI-powered template generation, advanced contact management, and detailed analytics.

## Features

- ✨ **Contact Management** - Import, organize, and segment subscribers with advanced tagging
- 🎨 **AI Template Generation** - Create professional HTML email templates using Cosmic Intelligence
- 📮 **Campaign Builder** - Design targeted campaigns with visual template selection
- 📊 **Analytics Dashboard** - Track open rates, click rates, and performance metrics
- 🗂️ **Template Library** - Browse and customize pre-built templates
- ⏰ **Campaign Scheduling** - Schedule campaigns for optimal send times
- 🎯 **Audience Segmentation** - Target specific subscriber groups with tags
- 📱 **Responsive Design** - Fully optimized for desktop and mobile

## Clone this Bucket and Code Repository

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Bucket and Code Repository](https://img.shields.io/badge/Clone%20this%20Bucket-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmic-staging.com/projects/new?clone_bucket=68a21e36b858141f9791a22b&clone_repository=68a2208ab858141f9791a241)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> Create an email marketing app like mailchimp. Functionality includes: 1) Create / manage contacts 2) Create HTML templates 3) Create campaigns with email templates.

### Code Generation Prompt

> Create an email marketing app like mailchimp. Functionality includes: 1) Create / manage contacts 2) Create HTML templates 3) Create campaigns with email templates. Use the Cosmic SDK AI generate text to create the templates

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Cosmic CMS** - Headless CMS for content management
- **Cosmic Intelligence** - AI-powered template generation
- **Inter Font** - Modern typography

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Cosmic account and bucket

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up your environment variables:
   ```env
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   ```

4. Run the development server:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Cosmic SDK Examples

### Fetching Contacts
```typescript
const contacts = await cosmic.objects
  .find({ type: 'contacts' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1)
```

### Creating Email Templates with AI
```typescript
const aiResponse = await cosmic.ai.generateText({
  prompt: 'Create a professional newsletter template with header, content sections, and footer',
  max_tokens: 1000
})

const template = await cosmic.objects.insertOne({
  type: 'email-templates',
  title: 'AI Generated Template',
  metadata: {
    template_name: 'AI Newsletter Template',
    subject_line: 'Your Monthly Update',
    html_content: aiResponse.text,
    template_category: 'newsletter'
  }
})
```

### Managing Campaigns
```typescript
const campaign = await cosmic.objects.insertOne({
  type: 'campaigns',
  title: 'Spring Sale Campaign',
  metadata: {
    campaign_name: 'Spring Sale Campaign',
    email_template: templateId,
    campaign_status: 'draft',
    target_tags: ['Newsletter', 'VIP Customer'],
    send_date: '2024-04-15'
  }
})
```

## Cosmic CMS Integration

This app integrates with three main object types in your Cosmic bucket:

- **Contacts** - Subscriber information with email, names, tags, and subscription status
- **Email Templates** - HTML templates with subject lines, categories, and preview images
- **Campaigns** - Marketing campaigns linking templates to target audiences with scheduling and analytics

The app uses Cosmic Intelligence for AI-powered template generation, automatically creating professional HTML email templates based on your prompts and requirements.

## Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy automatically

### Netlify
1. Build the project: `bun run build`
2. Deploy the `out` folder to Netlify
3. Configure environment variables in Netlify dashboard

For production deployments, ensure all environment variables are properly configured in your hosting platform.

<!-- README_END -->