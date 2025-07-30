# Social Media Sharing & Location Enhancement Plan

## 🎯 Project Overview

Enhance the report detail page (`/laporan/[id]`) with:

1. **Enhanced Location Display**: Show administrative hierarchy (Province → City/Regency → District)
2. **AI-Powered Social Media Sharing**: Modal-based sharing system with AI caption generation and tone selection
3. **Viral Engagement**: Strategic design to encourage sharing and amplify road damage visibility

---

## 🤖 AI Integration for Caption Generation

### AI Architecture Overview

**Technology Stack:**

- **OpenRouter API**: Unified interface for multiple AI models
- **DeepSeek Models**:
  - Free: `deepseek/deepseek-chat-v3-0324:free`
  - Paid: `deepseek/deepseek-chat-v3-0324`
- **OpenAI Node.js SDK**: For API integration
- **Fallback System**: Template-based generation when AI fails

### AI Service Layer Implementation

#### 1. Environment Configuration

```typescript
// Required environment variables
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL_FREE=deepseek/deepseek-chat-v3-0324:free
AI_MODEL_PAID=deepseek/deepseek-chat-v3-0324
AI_MAX_TOKENS=500
AI_TEMPERATURE=0.7
```

#### 2. AI Service Architecture

```typescript
// src/services/ai-service.ts
interface AIConfig {
  apiKey: string;
  baseURL: string;
  modelFree: string;
  modelPaid: string;
  maxTokens: number;
  temperature: number;
}

interface AICaptionRequest {
  reportData: ReportSharingData;
  tone: CaptionTone;
  platform: Platform;
  usePaidModel?: boolean;
  customInstructions?: string;
}

interface AICaptionResponse {
  caption: string;
  hashtags: string[];
  characterCount: number;
  platformOptimized: boolean;
  aiGenerated: boolean;
  modelUsed: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}
```

#### 3. AI Prompt Engineering

**System Prompts for Different Tones:**

```typescript
const AI_PROMPTS = {
  formal: `You are a professional civic engagement assistant. Generate a formal, respectful caption for sharing road damage reports on social media. Focus on:
- Professional tone addressing local government
- Clear location and damage description
- Request for official attention
- Appropriate hashtags for civic engagement
- Platform-specific optimization (${platform} character limits)`,

  urgent: `You are an urgent civic alert system. Generate an urgent, attention-grabbing caption for sharing critical road damage reports. Focus on:
- Emergency/urgent language with safety emphasis
- Immediate action required messaging
- Emotional appeal for public safety
- High-engagement hashtags
- Platform-specific optimization (${platform} character limits)`,

  community: `You are a community advocate. Generate a community-focused caption for sharing road damage reports. Focus on:
- Community solidarity and collective action
- Local pride and neighborhood improvement
- Encouraging community participation
- Community-focused hashtags
- Platform-specific optimization (${platform} character limits)`,

  informative: `You are a data-driven civic reporter. Generate an informative, fact-based caption for sharing road damage reports. Focus on:
- Objective reporting of facts
- Data transparency and accountability
- Government responsibility emphasis
- Information-focused hashtags
- Platform-specific optimization (${platform} character limits)`,
};
```

**User Prompt Template:**

```typescript
const generateUserPrompt = (
  reportData: ReportSharingData,
  platform: Platform,
) => `
Generate a social media caption for sharing this road damage report:

REPORT DATA:
- Category: ${reportData.category}
- Location: ${reportData.street_name}, ${reportData.district}, ${reportData.city}, ${reportData.province}
- Date Reported: ${formatDateForCaption(reportData.created_at)}
- Current Share Count: ${reportData.share_count}

PLATFORM: ${platform}
TONE: ${tone}

REQUIREMENTS:
1. Generate a compelling caption optimized for ${platform}
2. Include 3-5 relevant hashtags
3. Respect platform character limits
4. Match the specified tone
5. Encourage civic engagement and government action
6. Make it shareable and viral-worthy

Return the response in JSON format:
{
  "caption": "The generated caption text",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "explanation": "Brief explanation of the approach taken"
}
`;
```

### AI Integration in Backend Architecture

#### 1. Updated Core Layer (core.ts)

```typescript
// New AI-powered caption generation
export const generateAICaption = async (
  reportData: ReportSharingData,
  tone: CaptionTone,
  platform: Platform,
  usePaidModel: boolean = false,
): Promise<AppResult<AICaptionResponse>> => {
  try {
    // Call AI service
    const aiResponse = await aiService.generateCaption({
      reportData,
      tone,
      platform,
      usePaidModel,
    });

    if (!aiResponse.success) {
      // Fallback to template-based generation
      return generateCaptionFromTemplate(reportData, tone, platform);
    }

    // Process AI response
    const { caption, hashtags } = aiResponse.data;

    // Optimize for platform constraints
    const optimized = optimizeForPlatform(caption, hashtags, platform);

    return createSuccess({
      ...optimized,
      aiGenerated: true,
      modelUsed: aiResponse.data.modelUsed,
      tokenUsage: aiResponse.data.tokenUsage,
    });
  } catch (error) {
    // Fallback to template-based generation
    return generateCaptionFromTemplate(reportData, tone, platform);
  }
};
```

#### 2. Updated Shell Layer (shell.ts)

```typescript
// New AI-powered caption generation endpoint
export const generateAIReportCaption = async (
  reportId: string,
  captionRequest: GenerateAICaptionRequest,
): Promise<AppResult<AICaptionResponse>> => {
  try {
    // Validate request
    const validation = validateAICaptionRequest(captionRequest);
    if (!validation.success) {
      return validation;
    }

    // Get report data
    const reportResult = await data.getReportForSharing(reportId);
    if (!reportResult.success) {
      return reportResult;
    }

    // Generate AI caption
    const aiResult = await core.generateAICaption(
      reportResult.data,
      captionRequest.tone,
      captionRequest.platform,
      captionRequest.usePaidModel,
    );

    return aiResult;
  } catch (error) {
    return createError(
      `Failed to generate AI caption: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};
```

#### 3. Updated API Layer (api.ts)

```typescript
// New AI caption generation endpoint
const generateAICaptionRoute = createRoute({
  method: "post",
  path: "/{id}/generate-ai-caption",
  request: {
    params: SharingReportParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GenerateAICaptionSchema,
        },
      },
    },
  },
  summary: "Generate AI-powered sharing caption",
  description:
    "Generate a context-aware caption using AI for social media sharing",
  tags: ["Sharing", "AI"],
  responses: {
    200: {
      description: "AI caption generated successfully",
      content: {
        "application/json": { schema: AICaptionResponseSchema },
      },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    404: {
      description: "Report not found or not eligible for sharing",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    500: {
      description: "Internal server error or AI service unavailable",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// AI caption handler
sharingRouter.openapi(generateAICaptionRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");
    const captionRequest = c.req.valid("json");

    const result = await shell.generateAIReportCaption(id, captionRequest);

    if (result.success) {
      return c.json(result.data, 200);
    }

    const statusCode =
      result.statusCode === 404 ? 404 : result.statusCode === 400 ? 400 : 500;

    return c.json(
      {
        error: {
          code: "AI_CAPTION_GENERATION_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  } catch (error) {
    console.error("Error in AI caption generation handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate AI caption",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});
```

### AI Features & Capabilities

#### 1. Smart Caption Generation

**Context-Aware Messaging:**

- Analyzes report category, location, and severity
- Adapts tone based on damage type and urgency
- Considers local government structure and responsibilities
- Incorporates current events and seasonal factors

**Platform Optimization:**

- Character limit awareness for each platform
- Platform-specific hashtag strategies
- URL handling optimization
- Engagement pattern adaptation

#### 2. Advanced Hashtag Generation

**Dynamic Hashtag Strategies:**

- Category-specific hashtags (e.g., #PotholeAlert for berlubang)
- Location-based hashtags (e.g., #JakartaPusat, #Menteng)
- Government accountability hashtags (e.g., #FixOurRoads, #PublicService)
- Viral engagement hashtags (e.g., #ViralkanJalan, #CommunityAction)

**Hashtag Optimization:**

- Trending hashtag integration
- Platform-specific hashtag density
- Character count optimization
- Engagement potential analysis

#### 3. Multi-Language Support

**Indonesian Language Optimization:**

- Natural Indonesian language generation
- Local slang and expressions
- Cultural context awareness
- Regional dialect adaptation

**Future Language Support:**

- English caption generation
- Regional language support (Javanese, Sundanese, etc.)
- Multi-language caption generation

#### 4. AI Model Selection

**Free Model Usage:**

- Default for all users
- Good quality for basic caption generation
- Rate limiting and usage tracking
- Fallback to template-based generation

**Paid Model Usage:**

- Premium users or high-priority reports
- Enhanced creativity and context awareness
- Better multilingual support
- Advanced prompt engineering

### AI Error Handling & Fallback

#### 1. Graceful Degradation

```typescript
const handleAIFailure = async (
  reportData: ReportSharingData,
  tone: CaptionTone,
  platform: Platform,
  error: Error,
): Promise<AppResult<CaptionResponse>> => {
  console.warn(
    "AI caption generation failed, falling back to template:",
    error.message,
  );

  // Log AI failure for monitoring
  await logAIFailure(error, reportData.id, tone, platform);

  // Fallback to template-based generation
  return generateCaptionFromTemplate(reportData, tone, platform);
};
```

#### 2. AI Service Monitoring

```typescript
interface AIMetrics {
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  modelUsage: Record<string, number>;
  fallbackRate: number;
}

const trackAIMetrics = async (
  success: boolean,
  modelUsed: string,
  responseTime: number,
  fallbackUsed: boolean,
) => {
  // Track AI performance metrics
  // Monitor for service degradation
  // Alert on high error rates
};
```

### AI Cost Management

#### 1. Token Usage Optimization

```typescript
const optimizeTokenUsage = (prompt: string, maxTokens: number) => {
  // Optimize prompt length
  // Use efficient system prompts
  // Implement token counting
  // Set appropriate max_tokens
};
```

#### 2. Rate Limiting

```typescript
const rateLimitConfig = {
  freeModel: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
  },
  paidModel: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000,
  },
};
```

---

## 📍 Location Enhancement

### Current State Analysis

- ✅ Basic location data available: `street_name`, `location_text`, coordinates
- ✅ Administrative data available: `province`, `city`, `district` (text fields)
- ✅ Optional administrative codes: `province_code`, `regency_code`, `district_code`
- ❌ Missing: Clear administrative hierarchy display for user understanding

### Location UI Enhancement

#### 1. Administrative Hierarchy Component

```typescript
// New component: components/details/location-hierarchy.tsx
interface LocationHierarchyProps {
  province: string;
  city: string; // Regency/City
  district: string; // Kecamatan
  streetName: string;
  coordinates?: { lat: number; lon: number };
}
```

**Design Specification:**

- **Layout**: Breadcrumb-style hierarchy with subtle separators
- **Typography**: Following luxury monochrome design system
- **Visual Elements**:
  - MapPin icon (from Lucide)
  - Subtle dividers using `text-neutral-400`
  - Hierarchical typography sizing
- **Responsive**: Stack vertically on mobile, horizontal on desktop

#### 2. Integration Point

- **Location**: Replace existing location section in report detail page
- **Position**: Below hero image, above report description
- **Card Structure**: Use existing card design system for consistency

---

## 📱 Social Media Sharing System

### Core Requirements

#### 1. Share Button Integration

- **Position**: Prominently placed in viewport - Hero section (top-right of image overlay)
- **Design**: Large, visible share button with share count display
- **Icon**: Share icon from Lucide with share count badge
- **Behavior**: Opens Dialog overlay (using existing UI Dialog component)

#### 2. Social Media Sharing Dialog

**Dialog Structure:**

```typescript
// New component: components/details/share-dialog.tsx
interface ShareDialogProps {
  report: ReportWithUser;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess: () => void; // Track share count
}
```

**Dialog Sections:**

1. **Header**: "Bagikan Laporan Kerusakan Jalan"
2. **Location Summary**: Administrative hierarchy display
3. **AI Caption Generation**: AI-powered caption with tone selection
4. **Tone Selection**: Dropdown for communication style
5. **Social Media Platforms**: Button grid for sharing
6. **Manual Caption**: Textarea for custom editing
7. **AI Model Selection**: Free vs Paid model toggle

#### 3. AI Caption Generation System

**AI-Powered Approach:**

```typescript
// utils/ai-caption-generator.ts
interface AICaptionOptions {
  tone: "formal" | "urgent" | "community" | "informative";
  platform: "twitter" | "facebook" | "instagram" | "whatsapp" | "telegram";
  usePaidModel: boolean;
  customInstructions?: string;
}
```

**AI Caption Features:**

- **Context-Aware**: Analyzes report data, location, and damage type
- **Platform-Optimized**: Adapts to platform-specific requirements
- **Tone-Adaptive**: Generates appropriate tone for different audiences
- **Hashtag Intelligence**: Smart hashtag selection based on context
- **Fallback System**: Template-based generation when AI fails

#### 4. Share Count Tracking System

**Database Schema Addition:**

```sql
-- Add share_count column to reports table
ALTER TABLE reports ADD COLUMN share_count INTEGER DEFAULT 0;
```

**API Endpoint:**

```typescript
// New endpoint: POST /api/reports/:id/share
interface ShareTrackingRequest {
  platform: "whatsapp" | "twitter" | "facebook" | "instagram" | "telegram";
}

interface ShareTrackingResponse {
  success: boolean;
  newShareCount: number;
}
```

**Share Count Display:**

- Show share count on report detail page (in main content area, not in dialog)
- Display in sidebar "Informasi Laporan" section below existing metadata
- Update count in real-time after successful share
- Display format: "123 shares" or "1.2K shares" for large numbers

#### 5. Social Media Platform Integration

**Supported Platforms:**

1. **WhatsApp**: `whatsapp://send?text=[encoded_caption]`
2. **Twitter/X**: `https://twitter.com/intent/tweet?text=[encoded_caption]&url=[report_url]`
3. **Facebook**: `https://www.facebook.com/sharer/sharer.php?u=[report_url]&quote=[encoded_caption]`
4. **Instagram**: Copy caption to clipboard (Instagram doesn't support direct sharing with text)
5. **Telegram**: `https://t.me/share/url?url=[report_url]&text=[encoded_caption]`

**Platform-Specific Adaptations:**

- **Character limits**: Twitter (280), others flexible
- **Hashtag strategies**: Platform-appropriate hashtag density
- **URL handling**: Shortened URLs for character-limited platforms

**Share Success Tracking:**

- Track share button clicks per platform
- Increment share_count when dialog successfully opens platform sharing
- Show success feedback with updated count

---

## 🎨 UI/UX Design Specifications

### Design System Compliance

Following **Viralkan Design System 2.0** principles:

#### Color Palette

- **Primary**: Luxury monochrome (`neutral-900`, `neutral-700`, `neutral-500`)
- **Strategic Accents**:
  - Share button hover: Subtle `neutral-800` with elevation
  - Success feedback: `success-50` background, `success-600` text
  - Platform-specific subtle hints (5% color rule)
  - AI indicator: `blue-50` background, `blue-600` text

#### Typography

- **Modal Title**: `text-display-sm` (1.875rem) with `font-semibold`
- **Section Headers**: `text-lg` (1.125rem) with `font-medium`
- **Body Text**: `text-base` (1rem) with `leading-normal`
- **Captions**: `text-sm` (0.875rem) with `text-neutral-600`
- **AI Badge**: `text-xs` (0.75rem) with `font-medium`

#### Spacing & Layout

- **Modal**: `max-w-2xl` with `shadow-modal` elevation
- **Section Spacing**: `space-6` (1.5rem) between major sections
- **Button Grid**: `grid-cols-2 md:grid-cols-3` with `gap-3`
- **Form Elements**: `space-4` (1rem) vertical spacing

#### Component Specifications

##### Hero Share Button (Viewport-First)

```css
.hero-share-button {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: rgb(255 255 255 / 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  padding: var(--space-3);
  transition: var(--transition-button);
  box-shadow: var(--shadow-lg);

  &:hover {
    background: rgb(255 255 255 / 1);
    transform: scale(1.05);
    box-shadow: var(--shadow-xl);
  }

  .share-count-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--color-accent);
    color: white;
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    min-width: 20px;
    text-align: center;
  }
}
```

##### Dialog Overlay (Using existing Dialog component)

```css
.share-dialog-content {
  background: var(--surface-card);
  border-radius: var(--radius-modal);
  box-shadow: var(--shadow-modal);
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.share-count-display {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--border-muted);

  .share-icon {
    width: var(--space-4);
    height: var(--space-4);
    color: var(--color-neutral-500);
  }

  .count-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);

    .count-number {
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }
  }
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-blue-50);
  color: var(--color-blue-600);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-blue-200);
}
```

##### Platform Buttons

```css
.platform-button {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition-button);

  &:hover {
    background: var(--color-neutral-50);
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }

  /* Platform-specific subtle color hints (5% rule) */
  &.whatsapp:hover {
    background: rgb(34 197 94 / 0.05); /* green-500/5% */
    border-color: rgb(34 197 94 / 0.2);
  }

  &.twitter:hover {
    background: rgb(59 130 246 / 0.05); /* blue-500/5% */
    border-color: rgb(59 130 246 / 0.2);
  }
}
```

---

## 🏗️ Implementation Plan

### Phase 1: AI Backend Integration (Sprint 1) - **BACKEND ONLY**

#### Week 1: AI Service Layer

1. **Create AI Service Infrastructure**
   - Set up OpenRouter API client configuration
   - Implement AI service with DeepSeek models
   - Add environment variable configuration
   - Create AI error handling and fallback system

2. **Update Core Layer with AI Functions**
   - Add `generateAICaption` function
   - Implement AI prompt engineering
   - Add AI response processing and optimization
   - Maintain template-based fallback

3. **Update Shell Layer for AI Orchestration**
   - Add `generateAIReportCaption` function
   - Implement AI request validation
   - Add AI error handling and fallback logic
   - Coordinate between AI service and core logic

#### Week 2: API Integration & Testing

1. **Update API Layer**
   - Add new `/generate-ai-caption` endpoint
   - Update existing `/generate-caption` endpoint
   - Add AI-specific validation schemas
   - Implement proper error handling

2. **Update Types and Schemas**
   - Add AI-specific request/response types
   - Update validation schemas for AI endpoints
   - Add AI configuration types
   - Update OpenAPI documentation

3. **Testing and Validation**
   - Unit tests for AI service functions
   - Integration tests for AI endpoints
   - Error handling and fallback testing
   - Performance testing for AI responses

### Phase 2: Complete UI Implementation (Sprint 2) - **UI ONLY**

#### Week 3: Core UI Components

1. **Create LocationHierarchy Component**
   - Design breadcrumb-style layout with proper hierarchy display
   - Implement responsive typography following design system
   - Add proper ARIA labels for accessibility
   - Use mock/static data for demonstration

2. **Create HeroShareButton Component**
   - Position as overlay on hero image (top-right)
   - Implement glass morphism design with backdrop blur
   - Add share count badge (using mock count initially)
   - Hover animations and micro-interactions

3. **Create ShareDialog Component**
   - Use existing Dialog UI component from @repo/ui
   - Implement full dialog layout with all sections
   - Add proper focus management and keyboard navigation
   - Use mock data for all functionality

#### Week 4: AI Integration UI

1. **AI Caption Generation UI**
   - Create AI-powered caption generation component
   - Add AI model selection (Free vs Paid)
   - Implement AI loading states and error handling
   - Add AI-generated caption display with editing capabilities

2. **Tone Selection & Platform Optimization**
   - Create ToneSelector dropdown with all tone options
   - Build platform-specific optimization display
   - Add character counter for different platforms
   - Implement AI-generated hashtag display

3. **Platform Buttons Grid**
   - Create PlatformButtons component with all 5 platforms
   - Design platform-specific hover states with subtle colors
   - Add copy-to-clipboard functionality (for Instagram)
   - **Buttons show success feedback but don't actually share**

#### Week 5: Integration & Polish

1. **Integrate All Components into Report Detail Page**
   - Replace existing location section with LocationHierarchy
   - Add HeroShareButton to hero image overlay
   - Add ShareCount to sidebar
   - Connect all components with proper state management

2. **UI Polish & Responsive Design**
   - Ensure mobile-first responsive behavior
   - Apply luxury monochrome design tokens consistently
   - Add smooth transitions and animations
   - Cross-device testing and refinement

3. **Accessibility & Testing**
   - WCAG AA compliance testing
   - Screen reader compatibility
   - Keyboard navigation testing
   - Edge cases for long text, missing data, etc.

### Phase 3: Backend Integration & Analytics (Sprint 3)

#### Week 6: Backend Integration

1. **Database Schema Changes**
   - Add `share_count` column to reports table
   - Create database migration
   - Update report model to include share_count

2. **API Endpoint Development**
   - Create `POST /api/reports/:id/share` endpoint
   - Implement share count increment logic
   - Add platform tracking for analytics
   - Update existing report endpoints to include share_count

#### Week 7: Frontend-Backend Integration

1. **Replace Mock Data with Real API Calls**
   - Connect ShareCount component to real data
   - Implement share tracking when platforms are clicked
   - Add error handling for failed API calls
   - Real-time share count updates

2. **Platform Integration**
   - Implement actual social media sharing URLs
   - Handle platform-specific requirements
   - Add success/error feedback for real shares
   - Test cross-platform sharing functionality

### Phase 4: Advanced AI Features & Analytics (Sprint 4)

#### Week 8: Enhanced AI Features

1. **Advanced AI Caption Generation**
   - Implement dynamic location insertion
   - Add category-specific messaging
   - Platform-optimized hashtag strategies
   - Character limit handling per platform

2. **AI Analytics & Monitoring**
   - Add AI usage analytics tracking
   - Implement AI performance monitoring
   - Add AI cost tracking and optimization
   - A/B testing setup for different AI approaches

---

## 🎯 Success Metrics

### User Engagement

- **Share Button Clicks**: Target 15% click rate on report detail pages
- **Modal Completions**: Target 60% of modal opens result in shares
- **Platform Distribution**: Track which platforms are most popular
- **AI Caption Usage**: Monitor AI vs. template caption usage
- **AI Model Performance**: Track free vs. paid model usage

### Viral Metrics

- **Social Media Mentions**: Track #ViralkanJalan hashtag usage
- **Referral Traffic**: Measure social media → app conversion
- **Report Visibility**: Increased views on shared reports
- **Community Engagement**: Comments, likes, reshares on social platforms

### AI Performance Metrics

- **AI Success Rate**: Target >95% successful AI caption generation
- **AI Response Time**: Target <3 seconds for caption generation
- **Fallback Rate**: Monitor template fallback usage
- **User Satisfaction**: AI-generated caption quality ratings
- **Cost Efficiency**: Token usage optimization and cost tracking

### Technical Metrics

- **Modal Performance**: <200ms open time
- **Sharing Success Rate**: >95% successful share attempts
- **Mobile Usability**: <3 taps to complete sharing
- **Accessibility Score**: WCAG AA compliance
- **AI Service Uptime**: >99.9% availability

---

## 🔧 Technical Architecture

### Component Structure

```
components/
├── details/
│   ├── location-hierarchy.tsx        # Administrative location display
│   ├── share-dialog.tsx             # Main sharing dialog (using Dialog UI)
│   ├── share-count.tsx              # Share count display for sidebar
│   ├── hero-share-button.tsx        # Hero overlay share button
│   ├── platform-buttons.tsx         # Social media platform grid
│   ├── ai-caption-generator.tsx     # AI-powered caption generation UI
│   ├── tone-selector.tsx            # Tone selection dropdown
│   └── ai-model-selector.tsx        # AI model selection (Free vs Paid)
│
├── ui/
│   ├── dialog.tsx                   # Existing Dialog component (reuse)
│   ├── copy-button.tsx              # Copy to clipboard utility
│   └── ai-badge.tsx                 # AI indicator badge
│
└── utils/
    ├── ai-caption-templates.ts       # AI prompt engineering
    ├── share-utils.ts               # Platform-specific sharing URLs
    ├── share-tracking.ts            # Share count increment API calls
    ├── url-shortener.ts             # URL shortening for character limits
    ├── ai-service.ts                # AI service integration
    └── social-analytics.ts          # Optional sharing analytics
```

### Backend Architecture

```
src/
├── services/
│   └── ai-service.ts                # AI service with OpenRouter integration
├── routes/sharing/
│   ├── api.ts                       # Updated with AI endpoints
│   ├── shell.ts                     # Updated with AI orchestration
│   ├── core.ts                      # Updated with AI functions
│   ├── data.ts                      # Database operations (unchanged)
│   └── types.ts                     # Updated with AI types
└── config/
    └── ai.ts                        # AI configuration and environment
```

### State Management

```typescript
// Share dialog state with AI integration
interface ShareDialogState {
  isOpen: boolean;
  selectedTone: ToneType;
  aiGeneratedCaption: string;
  customCaption: string;
  isGeneratingAI: boolean;
  aiError: string | null;
  shareSuccess: boolean;
  shareError: string | null;
  shareCount: number; // Current share count
  isTrackingShare: boolean; // Loading state for share tracking
  usePaidModel: boolean; // AI model selection
  aiModelUsed: string; // Which AI model was used
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

// Location state (from report data)
interface LocationState {
  province: string;
  city: string;
  district: string;
  streetName: string;
  coordinates?: { lat: number; lon: number };
}

// Report with share count
interface ReportWithShareCount extends ReportWithUser {
  share_count: number;
}
```

### API Considerations

- **Backend changes required** for share count tracking and AI integration
- **New endpoints**:
  - `POST /api/reports/:id/share` for incrementing share count
  - `POST /api/reports/:id/generate-ai-caption` for AI caption generation
- **Database migration**: Add `share_count` column to reports table
- **Report endpoint update**: Include share_count in report responses
- **AI service integration**: OpenRouter API with DeepSeek models
- **Environment variables**: OpenRouter API key and configuration
- **Future**: AI-powered caption generation API

---

## ♿ Accessibility Requirements

### WCAG AA Compliance

1. **Modal Focus Management**
   - Trap focus within modal
   - Return focus to trigger button on close
   - Proper ARIA labels and roles

2. **Keyboard Navigation**
   - Tab order through all interactive elements
   - Enter/Space activation for buttons
   - Escape key modal closing

3. **Screen Reader Support**
   - Proper heading hierarchy
   - Descriptive button labels
   - Status announcements for sharing success/failure
   - AI generation status announcements

4. **Color & Contrast**
   - Maintain 4.5:1 contrast ratio minimum
   - Don't rely on color alone for information
   - Focus indicators meet 3:1 contrast

### Mobile Accessibility

1. **Touch Targets**
   - Minimum 44px touch target size
   - Adequate spacing between buttons
   - Easy thumb access on mobile devices

2. **Text Sizing**
   - Readable at system default size
   - Proper scaling with user preferences
   - No horizontal scrolling required

---

## 🚀 Future Enhancements

### Phase 5: Advanced AI Features (Future)

1. **Share Cards/OG Images**
   - Generate dynamic images for better social previews
   - Include report photo, location, and damage category
   - Platform-optimized aspect ratios

2. **Deep Linking**
   - Social media → specific report navigation
   - Campaign tracking for viral sharing
   - Attribution for successful repairs

3. **Community Features**
   - Share with local government directly
   - Tag relevant officials or agencies
   - Community challenge campaigns

### Phase 6: Advanced AI Integration (Future)

1. **Smart Caption Generation**
   - Multi-language support (English, regional languages)
   - Context-aware messaging based on current events
   - Personalized sharing strategies

2. **Optimal Sharing Times**
   - AI-powered timing recommendations
   - Platform-specific peak engagement times
   - Personalized sharing strategies

3. **Impact Tracking**
   - AI analysis of sharing effectiveness
   - Repair outcome correlation
   - Government response tracking

4. **Advanced AI Models**
   - GPT-4 integration for enhanced creativity
   - Claude integration for better reasoning
   - Multi-model ensemble for optimal results

---

## 📋 Implementation Checklist

### Development Tasks

- [ ] Set up OpenRouter API configuration and environment variables
- [ ] Create AI service layer with DeepSeek model integration
- [ ] Implement AI prompt engineering for different tones and platforms
- [ ] Add AI error handling and fallback to template-based generation
- [ ] Update core layer with AI caption generation functions
- [ ] Update shell layer for AI orchestration
- [ ] Add new AI caption generation API endpoint
- [ ] Update types and schemas for AI integration
- [ ] Create LocationHierarchy component with responsive design
- [ ] Implement ShareDialog using existing Dialog UI component
- [ ] Create HeroShareButton with viewport-first placement and share count badge
- [ ] Add ShareCount component for sidebar display
- [ ] Build AI-powered caption generation UI with model selection
- [ ] Create platform-specific sharing functions
- [ ] Add social media platform buttons with hover states
- [ ] Implement copy-to-clipboard functionality
- [ ] Add share count tracking API endpoint and database migration
- [ ] Implement real-time share count updates
- [ ] Add proper error handling and success feedback
- [ ] Ensure WCAG AA accessibility compliance
- [ ] Add comprehensive TypeScript types
- [ ] Write unit tests for all components and AI functions
- [ ] Implement E2E tests for sharing flow
- [ ] Optimize for mobile-first responsive design
- [ ] Add AI performance monitoring and analytics
- [ ] Implement AI cost tracking and optimization

### Design Tasks

- [ ] Create high-fidelity mockups for LocationHierarchy
- [ ] Design ShareModal with luxury monochrome aesthetics
- [ ] Specify micro-interactions and animations
- [ ] Define platform button hover states
- [ ] Create mobile-responsive layouts
- [ ] Design error and success states
- [ ] Specify accessibility color contrast
- [ ] Create component documentation
- [ ] Design AI indicator badges and loading states

### Content Tasks

- [ ] Write AI prompt templates for all tones and platforms
- [ ] Define AI-generated hashtag strategies per platform
- [ ] Create platform-specific messaging guides
- [ ] Develop sharing best practices documentation
- [ ] Write accessibility documentation
- [ ] Create user testing scripts
- [ ] Document AI model selection guidelines

### Testing Tasks

- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing (iOS/Android)
- [ ] Screen reader accessibility testing
- [ ] Platform sharing functionality testing
- [ ] Performance testing (modal load times, AI response times)
- [ ] A/B testing setup for different AI approaches
- [ ] AI service reliability and fallback testing
- [ ] Token usage and cost optimization testing

---

This comprehensive plan transforms the report detail page into a powerful tool for viral road damage reporting with AI-powered caption generation while maintaining the luxury civic aesthetic and ensuring accessibility compliance. The phased approach allows for iterative development and testing, ensuring each component meets quality standards before moving to the next phase.
