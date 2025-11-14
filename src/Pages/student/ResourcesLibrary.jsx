import React, { useState, useEffect } from "react";
import API from "../../api/api";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";

import img1 from "../../assets/Images/img.png";
import img2 from "../../assets/Images/img2.png";
import img3 from "../../assets/Images/img3.png";

const resourceTypes = {
  article: { color: "text-blue-600" },
  video: { color: "text-red-600" },
  audio: { color: "text-blue-600" },
  worksheet: { color: "text-purple-600" },
  tool: { color: "text-orange-600" },
  book: { color: "text-yellow-600" },
};

const ResourcesLibrary = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState(new Set());
  const [selectedResource, setSelectedResource] = useState(null);

  const categories = [
    { id: "all", name: "All Resources", color: "bg-gray-500" },
    { id: "stress", name: "Stress Management", color: "bg-blue-500" },
    { id: "anxiety", name: "Anxiety Relief", color: "bg-blue-500" },
    { id: "mindfulness", name: "Mindfulness", color: "bg-teal-500" },
    { id: "study", name: "Study Skills", color: "bg-purple-500" },
    { id: "relationships", name: "Relationships", color: "bg-pink-500" },
    { id: "crisis", name: "Crisis Support", color: "bg-red-500" },
    { id: "selfcare", name: "Self-Care", color: "bg-orange-500" },
  ];

  const sampleResources = [
    {
      id: 1,
      title: "5-Minute Breathing Exercise for Stress",
      description:
        "A quick guided breathing technique to reduce stress and anxiety in moments of overwhelm.",
      category: "stress",
      type: "audio",
      duration: "5 min",
      difficulty: "Beginner",
      rating: 4.8,
      views: 1247,
      url: "/resources/breathing-exercise",
      featured: true,
      tags: ["breathing", "quick", "anxiety", "calm"],
      image: [img1],
      content: `
A quick guided breathing technique to reduce stress and anxiety in moments of overwhelm. Helps you reconnect with your body, calm your mind, and create a sense of inner balance.

 🎀 Introduction

Stress is a natural part of life, but when left unmanaged, it can affect both mental and physical wellbeing. The 5-Minute Breathing Exercise for Stress is designed as a short, effective practice to bring calm, clarity, and focus during hectic or overwhelming moments. By intentionally regulating your breath, you can activate the body’s parasympathetic nervous system — the relaxation response — and counteract the physiological effects of stress, such as tension, racing thoughts, and shallow breathing.

Whether you’re at home, at work, or even in a public space, this exercise can be a quick reset that restores calm and energy in just a few minutes. Regular practice can enhance emotional resilience, improve sleep, increase focus, and support overall mental wellness.

 🌼 Benefits of This Exercise

Reduces Stress and Anxiety: Deep breathing slows down the heart rate, lowers blood pressure, and reduces cortisol, the stress hormone.

Improves Focus and Mental Clarity: Mindful breathing brings attention to the present moment, helping you respond to challenges calmly.

Enhances Emotional Regulation: Practicing controlled breathing allows your mind to step back from automatic reactions to stress.

Promotes Better Sleep: Calming your nervous system before bedtime can help you fall asleep faster and improve sleep quality.

Supports Physical Wellbeing: Relaxed breathing reduces muscle tension, improves oxygen flow, and helps maintain overall energy levels.

 ✨ How to Prepare

Find a Quiet Space: Choose a location free from distractions, where you can sit or lie down comfortably.

Assume a Comfortable Position: Sit upright with your back straight or lie down with your arms relaxed by your sides.

Release Tension: Relax your shoulders, jaw, and hands. Let your body settle naturally.

Set an Intention: Remind yourself why you’re practicing this exercise — to create calm, clarity, and presence.

 📍 Step-by-Step Breathing Guide

Inhale Deeply (4 seconds):
Slowly breathe in through your nose. Feel your lungs and abdomen expand fully as you fill your body with air.

Hold Your Breath (4 seconds):
Pause gently, keeping your chest and shoulders relaxed. Notice the stillness and the sensation of fullness in your body.

Exhale Slowly (6 seconds):
Release the breath through your mouth, feeling tension and stress flow out with each exhale. Let your body soften with every release.

Repeat the Cycle (5 minutes):
Continue the inhale-hold-exhale rhythm for approximately five minutes. Focus entirely on the flow of your breath, noticing subtle sensations in your body. If your mind wanders, gently bring it back without judgment.

 🌺 Variations for Personal Preference

Box Breathing: Inhale for 4 seconds → Hold 4 seconds → Exhale 4 seconds → Hold 4 seconds. Ideal for mental clarity.

Counting Breath: Inhale for 4 → Exhale for 6 → Count each cycle to enhance focus.

Guided Visualization: Imagine a calming place or scenario while breathing to deepen relaxation.

Reflection & Mindfulness

After completing the exercise, take a few moments to observe:

How does your body feel now compared to before the exercise?

Did any thoughts or emotions arise during the practice?

How can you integrate this technique into your daily routine, especially in stressful situations?

Reflecting on your experience can help you notice improvements in both mental clarity and emotional regulation over time.

 🌷 Tips for Success

Practice Regularly: Even a few minutes daily can build a strong habit and reduce overall stress levels.

Stay Patient: The mind may wander — this is normal. Gently bring your focus back each time.

Use a Calm Environment: Dim lighting or soft background music can enhance relaxation.

Pair with Journaling: Note any insights or feelings after each session to track progress and patterns.

 Conclusion

The 5-Minute Breathing Exercise for Stress is a simple yet powerful tool. By dedicating just a few minutes a day to mindful breathing, you create space for calm, clarity, and emotional balance. Over time, this practice can become a cornerstone habit that supports resilience, focus, and overall wellbeing — helping you navigate stress with greater ease and mindfulness.
      `,
    },
    {
      id: 2,
      title: "Progressive Muscle Relaxation Guide",
      description:
        "Step-by-step guide to release physical tension and promote deep relaxation.",
      category: "stress",
      type: "video",
      duration: "15 min",
      difficulty: "Beginner",
      rating: 4.6,
      views: 892,
      url: "/resources/muscle-relaxation",
      featured: true,
      tags: ["relaxation", "sleep", "tension"],
      image: [img2],
      content: `
# Progressive Muscle Relaxation

## Technique Overview:
Progressive Muscle Relaxation (PMR) involves systematically tensing and relaxing different muscle groups to release physical tension.

## Step-by-Step Guide:

### 1. Preparation
• Find quiet, comfortable space
• Lie down or sit comfortably
• Take 3 deep breaths

### 2. Muscle Groups Sequence:
**Feet & Calves**
- Tense: Curl toes and flex feet (5 seconds)
- Release: Notice warmth and relaxation (30 seconds)

**Thighs & Glutes**
- Tense: Squeeze thigh muscles (5 seconds)
- Release: Feel tension melt away

**Hands & Arms**
- Tense: Make fists, tense biceps (5 seconds)
- Release: Enjoy heavy, relaxed feeling

**Shoulders & Neck**
- Tense: Shrug shoulders to ears (5 seconds)
- Release: Feel shoulders drop

**Face & Jaw**
- Tense: Clench jaw, squint eyes (5 seconds)
- Release: Smooth out facial muscles

### 3. Full Body Scan
• Mentally scan from head to toe
• Release any remaining tension
• Breathe deeply for 2 minutes

## Benefits:
• Reduces physical anxiety symptoms
• Improves sleep quality
• Increases body awareness
• Manages chronic pain
      `,
    },
    {
      id: 3,
      title: "Mindful Meditation for Beginners",
      description:
        "Learn the basics of mindfulness meditation with this gentle introduction.",
      category: "mindfulness",
      type: "audio",
      duration: "10 min",
      difficulty: "Beginner",
      rating: 4.9,
      views: 1563,
      url: "/resources/mindfulness-basics",
      featured: false,
      tags: ["meditation", "focus", "present"],
      image: [img3],
      content: `
# Mindfulness Meditation Fundamentals

## What is Mindfulness?
Mindfulness is the practice of paying attention to the present moment without judgment.

## Basic Practice:

### 1. Setting Up
• Sit comfortably with straight back
• Hands resting on knees
• Eyes slightly closed or soft gaze

### 2. Anchor Points:
**Breath Awareness**
- Notice natural breath rhythm
- Don't force or control breathing
- When mind wanders, gently return to breath

**Body Scan**
- Bring awareness to physical sensations
- Start from toes, move to head
- Notice without judgment

**Sound Awareness**
- Notice sounds around you
- Don't label or analyze
- Just observe and return to breath

### 3. Common Challenges & Solutions:

**Wandering Mind**
- Normal and expected
- Gently return focus 100+ times if needed
- Each return strengthens mindfulness muscle

**Physical Discomfort**
- Adjust position mindfully
- Observe discomfort without reaction
- Breathe into the area

## Daily Integration:
• Start with 5 minutes daily
• Use triggers: before meals, after waking
• Practice informal mindfulness during daily activities
      `,
    },
    {
      id: 4,
      title: "Cognitive Behavioral Therapy Worksheet",
      description:
        "Identify and challenge negative thought patterns using this practical worksheet.",
      category: "anxiety",
      type: "worksheet",
      duration: "20 min",
      difficulty: "Intermediate",
      rating: 4.7,
      views: 734,
      url: "/resources/cbt-worksheet",
      featured: false,
      tags: ["CBT", "thoughts", "patterns"],
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      content: `
# CBT Thought Record Worksheet

## The Cognitive Triangle:
Thoughts → Feelings → Behaviors

## Worksheet Sections:

### 1. Situation Analysis
• **Trigger:** What happened?
• **Automatic Thought:** What immediately went through your mind?
• **Emotion:** What did you feel? (Rate intensity 0-100)
• **Body Sensations:** Physical reactions?

### 2. Evidence Examination
**Evidence Supporting the Thought:**
- List facts that support your automatic thought

**Evidence Against the Thought:**
- Alternative explanations?
- Times this wasn't true?
- What would you tell a friend?

### 3. Balanced Thinking
• **Alternative Perspective:** More balanced view?
• **Realistic Assessment:** Probability of worst case?
• **Constructive Response:** Helpful way to think about this?

### 4. Re-rating & Action
• **New Emotion Intensity:** Re-rate (0-100)
• **Behavioral Plan:** Constructive action to take

## Example:
Situation: Friend didn't return call
Automatic Thought: "They're angry with me"
Evidence Against: They've been busy before, they initiated last plans
Balanced Thought: "They're probably busy, I'll check in tomorrow"
      `,
    },
    {
      id: 5,
      title: "Effective Study Schedule Planner",
      description:
        "Create a balanced study schedule that reduces burnout and improves retention.",
      category: "study",
      type: "tool",
      duration: "15 min",
      difficulty: "Beginner",
      rating: 4.5,
      views: 1023,
      url: "/resources/study-planner",
      featured: true,
      tags: ["planning", "time management", "academic"],
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      content: `
# Smart Study Scheduling System

## Core Principles:

### 1. Time Blocking
• 25-50 minute focused sessions
• 5-10 minute breaks between
• 15-30 minute longer breaks every 2-3 hours

### 2. Priority Matrix:
**Urgent & Important**
- Exams in 1-2 weeks
- Major assignments due soon

**Important but Not Urgent**
- Long-term projects
- Regular review sessions

**Urgent but Not Important**
- Group meetings
- Administrative tasks
im
**Neither Urgent nor Important**
- Perfectionism activities
- Over-researching

### 3. Weekly Template:

**Morning (8-12)**
- 2-3 focused sessions
- Difficult subjects first

**Afternoon (1-5)**
- 3-4 sessions with variety
- Include active recall practice

**Evening (6-9)**
- Light review only
- Planning for next day

## Study Techniques Integration:
• Spaced Repetition
• Active Recall
• Interleaving Subjects
• Pomodoro Technique
      `,
    },
    {
      id: 6,
      title: "Communication Skills for Healthy Relationships",
      description:
        "Learn effective communication techniques to improve your relationships.",
      category: "relationships",
      type: "article",
      duration: "8 min",
      difficulty: "Beginner",
      rating: 4.4,
      views: 567,
      url: "/resources/communication-skills",
      featured: false,
      tags: ["communication", "relationships", "social"],
      image: [img1],
      content: `
# Effective Communication Framework

## Active Listening Skills:

### 1. Reflective Listening
• Paraphrase what you heard
• "So what I'm hearing is..."
• Validate their perspective

### 2. Non-Verbal Cues
• Maintain eye contact
• Open body posture
• Nod and show engagement

### 3. Avoid Common Pitfalls
• Interrupting
• Problem-solving immediately
• Discounting feelings

## "I" Statements Formula:
"I feel [emotion] when [specific behavior] happens because [impact]."

**Instead of:** "You never listen to me!"
**Try:** "I feel frustrated when I'm interrupted because it makes me feel my thoughts aren't valued."

## Conflict Resolution Steps:

### 1. Soften Startup
• Begin gently without blame
• State positive need

### 2. Make and Receive Repairs
• Use humor appropriately
• Take breaks when needed
• Apologize sincerely

### 3. Compromise
• Find middle ground
• Understand underlying needs
• Create win-win solutions

## Practice Exercises:
• Daily check-ins with partner/friends
• Role-playing difficult conversations
• Journaling about communication patterns
      `,
    },
    {
      id: 7,
      title: "Crisis Support Resources",
      description:
        "Immediate support contacts and resources for crisis situations.",
      category: "crisis",
      type: "article",
      duration: "2 min",
      difficulty: "Beginner",
      rating: 5.0,
      views: 423,
      url: "/resources/crisis-support",
      featured: true,
      tags: ["emergency", "support", "urgent"],
      image: [img3],
      content: `
# Immediate Crisis Support Resources

## Emergency Contacts (24/7):

### National Hotlines:
• **National Suicide Prevention Lifeline:** 988
• **Crisis Text Line:** Text HOME to 741741
• **SAMHSA Helpline:** 1-800-662-4357

### Campus Resources:
• Counseling Center: [Your Campus Number]
• Campus Police: [Your Campus Emergency Number]
• Student Health Services: [Your Campus Number]

## What Constitutes a Crisis:
• Thoughts of harming self or others
• Inability to care for basic needs
• Severe panic attacks
• Traumatic events
• Substance abuse emergencies

## Immediate Coping Strategies:

### Grounding Techniques:
**5-4-3-2-1 Method:**
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

### Safety Planning:
1. Identify warning signs
2. Internal coping strategies
3. People to contact
4. Professional resources
5. Making environment safe

## Follow-up Care:
• Schedule counseling appointment
• Inform trusted friends/family
• Remove access to means if suicidal
• Create wellness recovery plan
      `,
    },
    {
      id: 8,
      title: "Self-Care Checklist & Planner",
      description:
        "Comprehensive self-care planner to maintain mental and emotional wellbeing.",
      category: "selfcare",
      type: "worksheet",
      duration: "10 min",
      difficulty: "Beginner",
      rating: 4.6,
      views: 678,
      url: "/resources/self-care-planner",
      featured: false,
      tags: ["self-care", "wellbeing", "routine"],
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
      content: `
# Holistic Self-Care Assessment & Planner

## Self-Care Domains:

### 1. Physical Self-Care
• **Sleep:** 7-9 hours quality sleep
• **Nutrition:** Balanced meals, hydration
• **Exercise:** 30 minutes daily movement
• **Medical:** Regular check-ups

### 2. Emotional Self-Care
• **Feelings:** Identify and express emotions
• **Boundaries:** Learn to say no
• **Compassion:** Practice self-kindness
• **Therapy:** Professional support when needed

### 3. Mental Self-Care
• **Learning:** New skills and knowledge
• **Mindfulness:** Present moment awareness
• **Creativity:** Artistic expression
• **Mental Breaks:** Digital detox periods

### 4. Social Self-Care
• **Connection:** Quality time with loved ones
• **Community:** Group activities and belonging
• **Alone Time:** Healthy solitude
• **Support System:** Trusted relationships

## Weekly Self-Care Planning:

### Daily Non-Negotiables:
1. Morning routine (15 min)
2. Movement break (10 min)
3. Evening wind-down (20 min)

### Weekly Check-ins:
• Sunday planning session
• Wednesday mid-week adjustment
• Friday celebration of wins

## Customization Tips:
• Start small with 1-2 new habits
• Track what actually feels restorative
• Adjust based on energy levels
• Be flexible and compassionate
      `,
    },
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  });

  const fetchResources = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setResources(sampleResources);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (resource) => resource.category === selectedCategory
      );
    }

    setFilteredResources(filtered);
  };

  const toggleFavorite = (resourceId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(resourceId)) {
      newFavorites.delete(resourceId);
    } else {
      newFavorites.add(resourceId);
    }
    setFavorites(newFavorites);
  };

  const getFeaturedResources = () => {
    return resources.filter((resource) => resource.featured);
  };

  const handleOpenResource = (resource) => {
    setSelectedResource(resource);
  };

  const handleCloseResource = () => {
    setSelectedResource(null);
  };

  const handleDownload = async (resource) => {
    try {
      const content = `
${resource.title}
${"=".repeat(resource.title.length)}

DESCRIPTION:
${resource.description}

CATEGORY: ${resource.category}
TYPE: ${resource.type}
DURATION: ${resource.duration}
DIFFICULTY: ${resource.difficulty}
RATING: ${resource.rating}/5
VIEWS: ${resource.views}

TAGS: ${resource.tags.map((tag) => `#${tag}`).join(", ")}

${"=".repeat(50)}
COMPLETE RESOURCE CONTENT
${"=".repeat(50)}

${resource.content}

${"=".repeat(50)}
DOWNLOAD INFORMATION
${"=".repeat(50)}
Downloaded from: Student Wellness Resources Library
Download Date: ${new Date().toLocaleDateString()}
Download Time: ${new Date().toLocaleTimeString()}
Resource URL: ${resource.url}
Image Reference: ${resource.image}

---
This resource contains comprehensive guidance and exercises for your wellbeing.
For best results, practice regularly and consult with healthcare professionals as needed.
      `;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.title.replace(
        /\s+/g,
        "_"
      )}_Complete_Resource.txt`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (resource.image) {
        try {
          const imageResponse = await fetch(resource.image);
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);

          const imageLink = document.createElement("a");
          imageLink.href = imageUrl;
          imageLink.download = `${resource.title.replace(
            /\s+/g,
            "_"
          )}_Visual_Guide.jpg`;
          document.body.appendChild(imageLink);
          imageLink.click();
          document.body.removeChild(imageLink);
          URL.revokeObjectURL(imageUrl);
        } catch (imageError) {
          console.warn("Could not download image:", imageError);
        }
      }

      console.log(`Downloaded complete resource: ${resource.title}`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const downloadAllResources = async () => {
    try {
      alert(
        "Starting download of all resources. You will receive both text files and images for each resource."
      );

      for (const resource of resources) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Delay between downloads
        await handleDownload(resource);
      }

      alert(
        "All resources have been downloaded successfully! Check your downloads folder."
      );
    } catch (error) {
      console.error("Bulk download failed:", error);
      alert(
        "Bulk download failed. Please try downloading resources individually."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Student_sidebar />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Student_sidebar />

      {/* Main Content */}
      <div className="flex-1 p-3 overflow-auto">
        <div className="w-full ">
          {/* Resource Detail Modal */}
          {selectedResource && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedResource.title}
                  </h2>
                  <button
                    onClick={handleCloseResource}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="prose max-w-none">
                    {/* Resource Image */}
                    {selectedResource.image && (
                      <div className="mb-6">
                        <img
                          src={selectedResource.image}
                          alt={selectedResource.title}
                          className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    <p className="text-gray-600 mb-4">
                      {selectedResource.description}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                      {selectedResource.content}
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCloseResource}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleDownload(selectedResource)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Download </span>
                      </button>
                    </div>
                    {selectedResource.image && (
                      <button
                        onClick={async () => {
                          try {
                            const imageResponse = await fetch(
                              selectedResource.image
                            );
                            const imageBlob = await imageResponse.blob();
                            const imageUrl = URL.createObjectURL(imageBlob);
                            const link = document.createElement("a");
                            link.href = imageUrl;
                            link.download = `${selectedResource.title.replace(
                              /\s+/g,
                              "_"
                            )}_image.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(imageUrl);
                          } catch (error) {
                            console.error("Image download failed:", error);
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Download Image Only</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header with Bulk Download */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Resources Library
                </h1>
                <p className="text-lg text-gray-600">
                  Explore curated mental health resources, tools, and exercises
                  to support your wellbeing
                </p>
              </div>
              <button
                onClick={downloadAllResources}
                className="px-6 py-3 bg-sky-400 text-white rounded-lg hover:bg-sky-500 flex items-center space-x-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Download All Resources</span>
              </button>
            </div>
          </div>

          {/* Categories Navigation */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Browse by Category
              </h2>
              <p className="text-gray-600">
                Choose a category to explore relevant resources
              </p>
            </div>

            <div className="flex flex-nowrap justify-center gap-2.5 overflow-x-auto pb-4 px-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
          px-5 py-3 rounded-xl transition-all duration-300 border-2 font-medium flex-shrink-0
          flex items-center space-x-2 min-w-[150px] justify-center
          ${
            selectedCategory === category.id
              ? "bg-sky-400 text-white"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-sky-400 shadow-sm"
          }
        `}
                >
                  <div
                    className={`
          w-5 h-7 rounded-lg flex items-center justify-center text-xs font-bold
          ${
            selectedCategory === category.id
              ? "bg-white/20 text-white"
              : "bg-blue-100 text-sky-400"
          }
        `}
                  >
                    {category.name[0]}
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Featured Resources */}
          {selectedCategory === "all" && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Featured Resources
                </h2>
                <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFeaturedResources().map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isFavorite={favorites.has(resource.id)}
                    onToggleFavorite={() => toggleFavorite(resource.id)}
                    onOpenResource={() => handleOpenResource(resource)}
                    onDownload={() => handleDownload(resource)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resources Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {selectedCategory === "all"
                  ? "All Resources"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredResources.length} resources
              </span>
            </div>

            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No resources found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isFavorite={favorites.has(resource.id)}
                    onToggleFavorite={() => toggleFavorite(resource.id)}
                    onOpenResource={() => handleOpenResource(resource)}
                    onDownload={() => handleDownload(resource)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Resource Card Component with Image
const ResourceCard = ({
  resource,
  isFavorite,
  onToggleFavorite,
  onOpenResource,
  onDownload,
}) => {
  const typeInfo = resourceTypes[resource.type] || {
    icon: "📄",
    color: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      {/* Resource Image */}
      {resource.image && (
        <div className="h-48 overflow-hidden">
          <img
            src={resource.image}
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className={`text-lg ${typeInfo.color}`}>{typeInfo.icon}</span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {resource.type}
            </span>
          </div>
          <button
            onClick={onToggleFavorite}
            className="text-gray-400 hover:text-yellow-500 transition-colors"
          >
            {isFavorite ? (
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            )}
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {resource.description}
        </p>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {resource.duration}
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {resource.rating}
            </span>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              resource.difficulty === "Beginner"
                ? "bg-blue-100 text-blue-800"
                : resource.difficulty === "Intermediate"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {resource.difficulty}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onOpenResource}
            className="flex-1 bg-sky-400 text-white py-3 px-4 rounded-xl hover:bg-sky-500 transition-colors font-medium text-sm"
          >
            Open Resource
          </button>
          <button
            onClick={onDownload}
            className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            title="Download Complete Resource"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesLibrary;
