<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="header-content">
        <h1 class="logo">Blogtopia Admin</h1>
        <div class="header-actions">
          <button @click="toggleTheme" class="theme-btn" :title="`Switch to ${nextTheme} theme`">
            <svg v-if="theme === 'light'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg v-else-if="theme === 'dark'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 616.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
            </svg>
          </button>
          <router-link to="/" class="btn btn-secondary btn-sm">Back to Blogs</router-link>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div class="admin-container">
        <div class="editor-section">
          <h2 class="section-title">{{ isEditing ? 'Edit Blog' : 'Create New Blog' }}</h2>
          
          <div class="form-group">
            <label class="form-label">Blog Title</label>
            <input 
              v-model="blog.title" 
              type="text" 
              class="form-input" 
              placeholder="Enter blog title..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">Thumbnail URL</label>
            <input 
              v-model="blog.thumbnail" 
              type="url" 
              class="form-input" 
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div class="content-builder">
            <h3 class="subsection-title">Content Builder</h3>
            
            <div v-for="(row, rIndex) in blog.content" :key="rIndex" class="row-builder">
              <div class="row-header">
                <span class="row-label">Row {{ rIndex + 1 }}</span>
                <button @click="removeRow(rIndex)" class="btn btn-danger btn-sm">Remove</button>
              </div>

              <div class="columns-grid">
                <div v-for="(col, cIndex) in row.columns" :key="cIndex" class="column-builder">
                  <div class="column-header">
                    <span class="column-label">Column {{ cIndex + 1 }}</span>
                    <button @click="removeColumn(rIndex, cIndex)" class="btn btn-danger btn-sm">×</button>
                  </div>

                  <select v-model="col.type" class="form-input form-select mb-4">
                    <option value="text">Rich Text</option>
                    <option value="heading">Heading</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="list">Bullet List</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>

                  <div v-if="col.type === 'text' || col.type === 'paragraph'">
                    <textarea 
                      v-model="col.value" 
                      class="form-input form-textarea" 
                      placeholder="Enter content..."
                      rows="4"
                    ></textarea>
                  </div>

                  <div v-else-if="col.type === 'heading'">
                    <input 
                      v-model="col.value" 
                      type="text" 
                      class="form-input" 
                      placeholder="Enter heading..."
                    />
                  </div>

                  <div v-else-if="col.type === 'list'">
                    <textarea 
                      v-model="col.value" 
                      class="form-input form-textarea" 
                      placeholder="• First item&#10;• Second item"
                      rows="3"
                    ></textarea>
                  </div>

                  <div v-else-if="col.type === 'image' || col.type === 'video'">
                    <input 
                      v-model="col.value" 
                      type="url" 
                      class="form-input" 
                      placeholder="Enter URL..."
                    />
                  </div>
                </div>

                <button @click="addColumn(rIndex)" class="btn btn-secondary">+ Add Column</button>
              </div>
            </div>

            <button @click="addRow" class="btn btn-primary">+ Add Row</button>
          </div>

          <div class="editor-actions">
            <button @click="saveBlog" class="btn btn-primary btn-lg" :disabled="loading || !blog.title">
              {{ loading ? 'Saving...' : (isEditing ? 'Update Blog' : 'Publish Blog') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const { theme, setTheme } = useTheme()

const nextTheme = computed(() => {
  const themes = ['light', 'dark', 'sepia']
  const currentIndex = themes.indexOf(theme.value)
  return themes[(currentIndex + 1) % themes.length]
})

const toggleTheme = () => {
  setTheme(nextTheme.value)
}

const isEditing = computed(() => route.name === 'edit')
const blogId = computed(() => route.params.id)

const blog = ref({
  title: '',
  thumbnail: '',
  content: [
    {
      columns: [{ type: 'text', value: '' }]
    }
  ]
})

onMounted(async () => {
  if (isEditing.value) {
    await loadBlog()
  }
})

const loadBlog = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId.value)
      .single()

    if (error) throw error
    
    blog.value = {
      title: data.title,
      thumbnail: data.thumbnail || '',
      content: data.content || [{ columns: [{ type: 'text', value: '' }] }]
    }
  } catch (error) {
    console.error('Error loading blog:', error)
    alert('Failed to load blog: ' + error.message)
    router.push('/')
  } finally {
    loading.value = false
  }
}

const addRow = () => {
  blog.value.content.push({
    columns: [{ type: 'text', value: '' }]
  })
}

const removeRow = (index) => {
  if (blog.value.content.length > 1) {
    blog.value.content.splice(index, 1)
  }
}

const addColumn = (rowIndex) => {
  blog.value.content[rowIndex].columns.push({ type: 'text', value: '' })
}

const removeColumn = (rowIndex, colIndex) => {
  if (blog.value.content[rowIndex].columns.length > 1) {
    blog.value.content[rowIndex].columns.splice(colIndex, 1)
  }
}

const saveBlog = async () => {
  if (!blog.value.title.trim()) {
    alert('Blog title is required')
    return
  }

  // Temporarily disabled
  alert('Blog creation is temporarily disabled')
  return

  loading.value = true

  try {
    const blogData = {
      title: blog.value.title.trim(),
      thumbnail: blog.value.thumbnail.trim() || null,
      content: blog.value.content
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', blogId.value)

      if (error) throw error
      alert('Blog updated successfully!')
    } else {
      const { error } = await supabase
        .from('blogs')
        .insert(blogData)

      if (error) throw error
      alert('Blog published successfully!')
    }

    router.push('/')
  } catch (error) {
    console.error('Error saving blog:', error)
    alert('Failed to save blog: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.admin-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  padding: var(--spacing-6) 0;
  box-shadow: var(--shadow-md);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
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
}

.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }

.logo {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.admin-main {
  padding: var(--spacing-8) 0;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.editor-section {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-8) 0;
}

.subsection-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: var(--spacing-8) 0 var(--spacing-6) 0;
}

.form-group {
  margin-bottom: var(--spacing-6);
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.content-builder {
  margin-top: var(--spacing-8);
}

.row-builder {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-light);
}

.row-label {
  font-weight: 600;
  color: var(--text-primary);
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-4);
  align-items: start;
}

.column-builder {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--border-light);
}

.column-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.editor-actions {
  display: flex;
  justify-content: center;
  padding: var(--spacing-8) 0 0 0;
  margin-top: var(--spacing-8);
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .columns-grid {
    grid-template-columns: 1fr;
  }
}
</style>