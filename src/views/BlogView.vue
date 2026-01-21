<template>
  <div class="blog-layout">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading blog...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <h2 class="error-title">Blog not found</h2>
      <p class="error-description">The blog you're looking for doesn't exist or has been removed.</p>
      <router-link to="/" class="btn btn-primary">Back to Blogs</router-link>
    </div>

    <!-- Blog Content -->
    <div v-else-if="blog" class="blog-container">
      <!-- Reading Progress Bar -->
      <div class="reading-progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Floating Reactions -->
      <div class="floating-reactions">
        <div 
          v-for="reaction in floatingReactions" 
          :key="reaction.id"
          class="floating-reaction"
          :style="{ left: reaction.x + 'px', top: reaction.y + 'px' }"
        >
          {{ reaction.emoji }}
        </div>
      </div>
      <!-- Navigation -->
      <nav class="blog-nav">
        <div class="nav-content">
          <router-link to="/" class="back-link">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Blogs
          </router-link>
          <div class="nav-actions">
            <div class="reading-controls">
              <div class="font-size-controls">
                <button @click="setFontSize('small')" :class="{ active: fontSize === 'small' }" class="font-btn">A</button>
                <button @click="setFontSize('medium')" :class="{ active: fontSize === 'medium' }" class="font-btn">A</button>
                <button @click="setFontSize('large')" :class="{ active: fontSize === 'large' }" class="font-btn">A</button>
              </div>
              <button @click="() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light')" class="theme-btn" title="Toggle theme">
                <svg v-if="theme === 'light'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="theme === 'dark'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 616.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                </svg>
              </button>
              <div class="time-remaining" v-if="timeRemaining > 0">
                {{ Math.ceil(timeRemaining) }} min left
              </div>
            </div>
          </div>
          <div class="blog-meta-nav">
            <time class="blog-date">{{ formatDate(blog.created_at) }}</time>
            <span class="reading-time">{{ estimateReadingTime(blog) }} min read</span>
          </div>
        </div>
      </nav>

      <!-- Blog Header -->
      <header class="blog-header">
        <div class="header-content">
          <h1 class="blog-title">{{ blog.title }}</h1>
          <div class="blog-meta">
            <div class="meta-item">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
              </svg>
              <span>Published {{ formatDate(blog.created_at) }}</span>
            </div>
            <div class="meta-item">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{{ estimateReadingTime(blog) }} minute read</span>
            </div>
          </div>
        </div>
        
        <!-- Hero Image -->
        <div v-if="blog.thumbnail" class="hero-image-container">
          <img :src="blog.thumbnail" :alt="blog.title" class="hero-image" />
        </div>
      </header>

      <!-- Blog Content -->
      <main class="blog-main">
        <article class="blog-article">
          <div class="blog-content">
            <div v-for="(row, rIndex) in blog.content" :key="rIndex" class="content-row">
              <div 
                v-for="(col, cIndex) in row.columns" 
                :key="cIndex" 
                class="content-column"
                :class="`column-${row.columns.length}`"
              >
                <!-- Text Content -->
                <div v-if="col.type === 'text' || col.type === 'paragraph'" 
                     v-html="col.value" 
                     class="text-content"
                ></div>

                <!-- Heading -->
                <component 
                  v-else-if="col.type === 'heading'" 
                  :is="`h${col.level || 2}`" 
                  class="heading-content"
                  :class="`heading-${col.level || 2}`"
                >
                  {{ col.value }}
                </component>

                <!-- List -->
                <ul v-else-if="col.type === 'list'" class="list-content">
                  <li v-for="(item, index) in parseList(col.value)" :key="index" v-html="item"></li>
                </ul>

                <!-- Image -->
                <figure v-else-if="col.type === 'image'" class="image-content">
                  <img :src="col.value" :alt="col.alt || 'Blog image'" class="content-image" />
                  <figcaption v-if="col.caption" class="image-caption">{{ col.caption }}</figcaption>
                </figure>

                <!-- Video -->
                <div v-else-if="col.type === 'video'" class="video-content">
                  <div class="video-wrapper">
                    <iframe 
                      :src="getEmbedUrl(col.value)" 
                      frameborder="0" 
                      allowfullscreen
                      class="video-iframe"
                    ></iframe>
                  </div>
                </div>

                <!-- Audio -->
                <div v-else-if="col.type === 'audio'" class="audio-content">
                  <audio controls class="audio-player">
                    <source :src="col.value" type="audio/mpeg">
                    <source :src="col.value" type="audio/wav">
                    <source :src="col.value" type="audio/ogg">
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <!-- File Download -->
                <div v-else-if="col.type === 'file'" class="file-content">
                  <a :href="col.value" :download="col.fileName" class="file-download">
                    <div class="file-icon">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div class="file-info">
                      <span class="file-name">{{ col.fileName || 'Download File' }}</span>
                      <span class="file-action">Click to download</span>
                    </div>
                  </a>
                </div>

                <!-- Quote -->
                <blockquote v-else-if="col.type === 'quote'" class="quote-content">
                  <div class="quote-text">{{ col.value }}</div>
                  <cite v-if="col.author" class="quote-author">— {{ col.author }}</cite>
                </blockquote>

                <!-- Code Block -->
                <div v-else-if="col.type === 'code'" class="code-content">
                  <div class="code-header">
                    <span class="code-language">{{ col.language || 'code' }}</span>
                    <button @click="copyCode(col.value)" class="copy-button">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      Copy
                    </button>
                  </div>
                  <pre class="code-block"><code>{{ col.value }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <!-- Blog Footer -->
      <footer class="blog-footer">
        <!-- Reactions Section -->
        <div class="reactions-section">
          <h3 class="reactions-title">How did you like this article?</h3>
          <div class="reactions-container">
            <button 
              v-for="emoji in ['👍', '❤️', '🔥', '💡', '🎉']" 
              :key="emoji"
              @click="addReaction(blog.id, emoji, $event)"
              class="reaction-btn"
            >
              <span class="reaction-emoji">{{ emoji }}</span>
              <span class="reaction-count">{{ reactions[emoji] || 0 }}</span>
            </button>
          </div>
        </div>
        
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">Enjoyed this article?</h3>
            <p class="footer-description">Check out more articles on our blog.</p>
            <router-link to="/" class="btn btn-primary">View All Blogs</router-link>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import { useReadingProgress } from '../composables/useReadingProgress'
import { useReactions } from '../composables/useReactions'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const blog = ref(null)
const loading = ref(true)
const error = ref(false)
const { progress, timeRemaining, initializeReading } = useReadingProgress()
const { reactions, floatingReactions, loadReactions, addReaction } = useReactions()
const { theme, fontSize, setTheme, setFontSize } = useTheme()

onMounted(async () => {
  await loadBlog()
})

const loadBlog = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        error.value = true
      } else {
        throw fetchError
      }
    } else {
      blog.value = data
      initializeReading(data.word_count || 1000)
      await loadReactions(data.id)
    }
  } catch (err) {
    console.error('Error loading blog:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const parseList = (listText) => {
  if (!listText) return []
  return listText
    .split('\n')
    .map(item => item.replace(/^[•\-\*]\s*/, '').trim())
    .filter(item => item.length > 0)
}

const getEmbedUrl = (url) => {
  if (!url) return ''
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  
  return url
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert('Code copied to clipboard!')
  } catch (err) {
    alert('Failed to copy code')
  }
}

const estimateReadingTime = (blog) => {
  // Use word_count from database if available
  if (blog?.word_count && blog.word_count > 0) {
    return Math.max(1, Math.ceil(blog.word_count / 225))
  }
  
  // Fallback calculation if word_count is not available
  if (!blog?.content) return 1
  
  let wordCount = 0
  for (const row of blog.content) {
    if (!row.columns) continue
    for (const col of row.columns) {
      if (['text', 'paragraph', 'heading', 'list', 'quote'].includes(col.type)) {
        const plainText = col.value.replace(/<[^>]*>/g, '')
        wordCount += plainText.split(/\s+/).length
      }
    }
  }
  
  return Math.max(1, Math.ceil(wordCount / 225))
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.blog-layout {
  min-height: 100vh;
  background-color: var(--bg-primary);
  position: relative;
}

.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--border-light);
  z-index: 1000;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  transition: width 0.1s ease;
}

.floating-reactions {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 999;
}

.floating-reaction {
  position: absolute;
  font-size: 2rem;
  animation: floatUp 2s ease-out forwards;
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--spacing-8);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

.loading-text {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.error-icon {
  color: var(--text-muted);
  margin-bottom: var(--spacing-6);
}

.error-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;
}

.error-description {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--spacing-8) 0;
  max-width: 500px;
}

.blog-nav {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  padding: var(--spacing-4) 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.reading-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.font-size-controls {
  display: flex;
  gap: var(--spacing-1);
}

.font-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  transition: all 0.2s ease;
}

.font-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.font-btn:nth-child(2) { font-size: var(--font-size-sm); }
.font-btn:nth-child(3) { font-size: var(--font-size-base); }

.theme-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.w-4 { width: 1rem; }
.h-4 { height: 1rem; }

.time-remaining {
  background: var(--bg-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--primary-color);
}

.blog-meta-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.blog-date {
  font-weight: 500;
}

.reading-time {
  background-color: var(--bg-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.blog-header {
  padding: var(--spacing-12) 0;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  text-align: center;
}

.blog-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0 0 var(--spacing-8) 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.blog-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-6);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.hero-image-container {
  max-width: 800px;
  margin: var(--spacing-12) auto 0 auto;
  padding: 0 var(--spacing-6);
}

.hero-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
}

.blog-main {
  padding: var(--spacing-12) 0;
}

.blog-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.content-row {
  display: flex;
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
  flex-wrap: wrap;
}

.content-column {
  flex: 1;
  min-width: 0;
}

.column-1 {
  flex: 1;
}

.column-2 {
  flex: 1;
  min-width: 300px;
}

.column-3 {
  flex: 1;
  min-width: 250px;
}

/* Content Type Styles */
.text-content {
  line-height: 1.7;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.text-content p {
  margin-bottom: var(--spacing-6);
}

.text-content strong {
  font-weight: 600;
  color: var(--text-primary);
}

.text-content em {
  font-style: italic;
}

.text-content a {
  color: var(--primary-color);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.text-content a:hover {
  color: var(--primary-hover);
}

.heading-content {
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.3;
  margin: var(--spacing-8) 0 var(--spacing-6) 0;
}

.heading-1 {
  font-size: var(--font-size-3xl);
}

.heading-2 {
  font-size: var(--font-size-2xl);
}

.heading-3 {
  font-size: var(--font-size-xl);
}

.heading-4 {
  font-size: var(--font-size-lg);
}

.list-content {
  padding-left: var(--spacing-6);
  margin: var(--spacing-6) 0;
}

.list-content li {
  margin-bottom: var(--spacing-3);
  line-height: 1.6;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.image-content {
  margin: var(--spacing-8) 0;
  text-align: center;
}

.content-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.image-caption {
  margin-top: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-style: italic;
}

.video-content {
  margin: var(--spacing-8) 0;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg);
}

.audio-content {
  margin: var(--spacing-8) 0;
  text-align: center;
}

.audio-player {
  width: 100%;
  max-width: 500px;
}

.file-content {
  margin: var(--spacing-8) 0;
}

.file-download {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.file-download:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.file-icon {
  color: var(--primary-color);
}

.file-info {
  flex: 1;
}

.file-name {
  display: block;
  font-weight: 600;
  margin-bottom: var(--spacing-1);
}

.file-action {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.quote-content {
  margin: var(--spacing-8) 0;
  padding: var(--spacing-8);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-left: 4px solid var(--primary-color);
  border-radius: var(--radius-lg);
  position: relative;
}

.quote-content::before {
  content: '"';
  position: absolute;
  top: var(--spacing-4);
  left: var(--spacing-6);
  font-size: 4rem;
  color: var(--primary-color);
  opacity: 0.3;
  font-family: serif;
  line-height: 1;
}

.quote-text {
  font-size: var(--font-size-xl);
  font-style: italic;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: var(--spacing-4);
  padding-left: var(--spacing-8);
}

.quote-author {
  display: block;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-weight: 500;
  text-align: right;
  font-style: normal;
}

.code-content {
  margin: var(--spacing-8) 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
}

.code-language {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background-color: var(--primary-color);
  color: var(--text-inverse);
  border-color: var(--primary-color);
}

.code-block {
  background-color: var(--bg-secondary);
  padding: var(--spacing-6);
  margin: 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--text-primary);
}

.reactions-section {
  text-align: center;
  padding: var(--spacing-8) 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--spacing-8);
}

.reactions-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-6) 0;
}

.reactions-container {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.reaction-btn {
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  min-width: 60px;
}

.reaction-btn:hover {
  transform: scale(1.1);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.reaction-emoji {
  font-size: 1.5rem;
  line-height: 1;
}

.reaction-count {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.blog-footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-12) 0;
  margin-top: var(--spacing-12);
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  text-align: center;
}

.footer-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;
}

.footer-description {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--spacing-8) 0;
}

.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
.w-8 { width: 2rem; }
.h-8 { height: 2rem; }
.w-16 { width: 4rem; }
.h-16 { height: 4rem; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .nav-actions {
    order: -1;
  }
  
  .blog-title {
    font-size: var(--font-size-3xl);
  }
  
  .blog-meta {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .content-row {
    flex-direction: column;
    gap: var(--spacing-6);
  }
  
  .quote-text {
    font-size: var(--font-size-lg);
    padding-left: var(--spacing-6);
  }
  
  .code-header {
    flex-direction: column;
    gap: var(--spacing-2);
    align-items: flex-start;
  }
}
</style>