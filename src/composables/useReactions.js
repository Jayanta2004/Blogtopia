import { ref } from 'vue'
import { supabase } from '../supabase'

export function useReactions() {
  const reactions = ref({})
  const floatingReactions = ref([])

  const loadReactions = async (blogId) => {
    if (!blogId) return
    try {
      console.log('Loading reactions for blog:', blogId)
      const { data, error } = await supabase
        .from('blog_reactions')
        .select('reaction_type, count')
        .eq('blog_id', blogId)
      
      if (error) {
        console.error('Error loading reactions:', error)
        return
      }
      
      console.log('Loaded reactions:', data)
      reactions.value = data?.reduce((acc, item) => {
        acc[item.reaction_type] = item.count
        return acc
      }, {}) || {}
    } catch (error) {
      console.error('Error loading reactions:', error)
    }
  }

  const addReaction = async (blogId, reactionType, event) => {
    if (!blogId || !reactionType) return
    
    try {
      // Try using RPC function first
      const { error: rpcError } = await supabase.rpc('add_reaction', {
        blog_id: blogId,
        reaction_type: reactionType
      })

      if (rpcError) {
        // Fallback to manual upsert if RPC fails
        const { data: existing } = await supabase
          .from('blog_reactions')
          .select('count')
          .eq('blog_id', blogId)
          .eq('reaction_type', reactionType)
          .single()

        if (existing) {
          await supabase
            .from('blog_reactions')
            .update({ count: existing.count + 1 })
            .eq('blog_id', blogId)
            .eq('reaction_type', reactionType)
        } else {
          await supabase
            .from('blog_reactions')
            .insert({ blog_id: blogId, reaction_type: reactionType, count: 1 })
        }
      }

      // Update local state
      reactions.value[reactionType] = (reactions.value[reactionType] || 0) + 1
      
      // Add floating animation
      if (event?.target) {
        const rect = event.target.getBoundingClientRect()
        floatingReactions.value.push({
          id: Date.now(),
          emoji: reactionType,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })

        setTimeout(() => {
          floatingReactions.value = floatingReactions.value.slice(1)
        }, 2000)
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
      // Still show animation even if DB fails
      if (event?.target) {
        const rect = event.target.getBoundingClientRect()
        floatingReactions.value.push({
          id: Date.now(),
          emoji: reactionType,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
        setTimeout(() => {
          floatingReactions.value = floatingReactions.value.slice(1)
        }, 2000)
      }
    }
  }

  return { reactions, floatingReactions, loadReactions, addReaction }
}