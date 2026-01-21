<template>
  <div class="home-layout">
    <header class="home-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-with-icon">
            <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#E2E8F0;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#logoGradient)" stroke="#0EA5E9" stroke-width="2"/>
              <path d="M8 10h16v2H8v-2zm0 4h12v2H8v-2zm0 4h8v2H8v-2z" fill="#6366F1"/>
              <circle cx="24" cy="8" r="3" fill="#0EA5E9"/>
            </svg>
            <h1 class="logo">Blogtopia</h1>
          </div>
          <p class="tagline">Insights, tutorials, and stories from the community</p>
        </div>
        <div class="header-actions">
          <router-link to="/admin" class="btn btn-primary">Create Blog</router-link>
          <div class="theme-controls">
            <button @click="toggleTheme" class="theme-btn" :title="`Switch to ${nextTheme} theme`">
              <svg v-if="theme === 'light'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
              </svg>
              <svg v-else-if="theme === 'dark'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-container">
        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-container">
            <div class="search-input-wrapper">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="search-input" 
                placeholder="Search articles..."
                @input="handleSearch"
              />
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading blogs...</p>
        </div>

        <div v-else-if="blogs.length === 0" class="empty-state">
          <h3 class="empty-title">No blogs yet</h3>
          <p class="empty-description">Be the first to create a blog post.</p>
          <router-link to="/admin" class="btn btn-primary btn-lg">Create Your First Blog</router-link>
        </div>

        <div v-else class="blogs-section">
          <div class="section-header">
            <h2 class="section-title">Latest Articles</h2>
            <p class="section-subtitle">{{ blogs.length }} articles published</p>
          </div>

          <div class="blogs-grid">
            <article v-for="blog in filteredBlogs" :key="blog.id" class="blog-card">
              <div class="blog-card-image" :style="{ backgroundImage: `url(${blog.thumbnail || 'https://via.placeholder.com/400x250'})` }"></div>
              
              <div class="blog-card-content">
                <div class="blog-meta">
                  <time class="blog-date">{{ formatDate(blog.created_at) }}</time>
                  <span class="reading-time">{{ estimateReadingTime(blog) }} min read</span>
                </div>
                
                <h3 class="blog-title">
                  <router-link :to="`/blog/${blog.id}`" class="blog-title-link">
                    {{ blog.title }}
                  </router-link>
                </h3>
                
                <p v-if="blog.excerpt" class="blog-excerpt">{{ blog.excerpt }}</p>
                
                <div class="blog-actions">
                  <router-link :to="`/blog/${blog.id}`" class="read-more-btn">Read Article</router-link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useTheme } from '../composables/useTheme'

const blogs = ref([])
const loading = ref(true)
const searchQuery = ref('')
const { theme, setTheme } = useTheme()

const nextTheme = computed(() => {
  const themes = ['light', 'dark', 'sepia']
  const currentIndex = themes.indexOf(theme.value)
  return themes[(currentIndex + 1) % themes.length]
})

const toggleTheme = () => {
  setTheme(nextTheme.value)
}

const filteredBlogs = computed(() => {
  if (!searchQuery.value) return blogs.value
  
  const query = searchQuery.value.toLowerCase()
  return blogs.value.filter(blog => 
    blog.title.toLowerCase().includes(query) ||
    (blog.excerpt && blog.excerpt.toLowerCase().includes(query))
  )
})

const handleSearch = () => {
  // Search is handled by computed property
}

onMounted(async () => {
  await loadBlogs()
})

const loadBlogs = async () => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, thumbnail, created_at, excerpt, word_count')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    blogs.value = data || []
  } catch (error) {
    console.error('Error loading blogs:', error)
  } finally {
    loading.value = false
  }
}

const estimateReadingTime = (blog) => {
  if (blog.word_count && blog.word_count > 0) {
    return Math.max(1, Math.ceil(blog.word_count / 225))
  }
  return 1
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
.home-layout {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.home-header {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: white;
  padding: var(--spacing-8) 0;
  position: relative;
  box-shadow: var(--shadow-lg);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.theme-controls {
  display: flex;
  align-items: center;
}

.theme-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--spacing-2);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }

.logo-section {
  flex: 1;
}

.logo-with-icon {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.tagline {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-base);
  margin: 0;
  font-weight: 400;
}

.main-content {
  padding: var(--spacing-8) 0;
}

.search-section {
  margin-bottom: var(--spacing-10);
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-4) 3rem;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-2xl);
  font-size: var(--font-size-base);
  background-color: var(--bg-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(30 58 138 / 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-12) 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-4) auto;
}

.loading-text {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12) 0;
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;
}

.empty-description {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--spacing-8) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-10);
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: 0;
}

.blogs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-8);
}

.blog-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-light);
  position: relative;
}

.blog-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.blog-card:hover::before {
  transform: scaleX(1);
}

.blog-card-image {
  height: 220px;
  background-size: cover;
  background-position: center;
  background-color: var(--bg-tertiary);
}

.blog-card-content {
  padding: var(--spacing-6);
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
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

.blog-title {
  margin: 0 0 var(--spacing-4) 0;
  line-height: 1.3;
}

.blog-title-link {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.blog-title-link:hover {
  color: var(--primary-color);
}

.blog-excerpt {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-6) 0;
}

.blog-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.read-more-btn {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
}

.read-more-btn:hover {
  color: var(--primary-hover);
}

.edit-btn {
  color: var(--text-secondary);
  font-weight: 500;
  text-decoration: none;
  font-size: var(--font-size-sm);
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.edit-btn:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-4);
    text-align: center;
  }
  
  .blogs-grid {
    grid-template-columns: 1fr;
  }
}
</style>