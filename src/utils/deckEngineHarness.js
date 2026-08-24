/**
 * deckEngineHarness.js
 *
 * Full Harness & Programmatic Tool Specification Engine for Regaarder Deck.
 * Exposes all Deck functions, tools, shapes, and diagnostic features to LLMs / AI Agents
 * via standard JSON function calling schemas and deterministic execution dispatchers.
 */

export const DECK_ALLOWED_LAYOUTS = [
  'Title Slide',
  'Executive Summary',
  'Introduction & Overview',
  'Problem Statement',
  'Innovative Solutions',
  'Market Opportunity & Sizing',
  'Product Architecture',
  'Business Model & Revenue',
  'Competitive Advantage & Moat',
  'Financial Projections',
  'Team & Key Personnel',
  'Funding Ask & Allocation',
  'Closing & Contact'
];

export const DECK_ALLOWED_PRESETS = [
  'midnight-slate',
  'cyberpunk-neon',
  'mint-depth',
  'sunset-grid',
  'aurora-split',
  'executive-monochrome',
  'clean-paper'
];

export const DECK_ALLOWED_WAVE_STYLES = [
  'original-pitch',
  'cyber-mesh',
  'aurora-flow',
  'quantum-pulse',
  'matrix-stream',
  'zenith-spiral'
];

export const DECK_ALLOWED_WAVE_GLOWS = [
  'crisp',
  'ultra-radiant',
  'neon-bloom',
  'electric-high',
  'soft-ambient',
  'none'
];

export const DECK_ALLOWED_SHAPE_TYPES = [
  'heading',
  'textbox',
  'pill',
  'badge',
  'container',
  'rectangle',
  'circle',
  'triangle',
  'image',
  'bentoCard'
];

export const DECK_ALLOWED_AUDIT_METRICS = [
  'story-structure',
  'content-quality',
  'visual-hierarchy',
  'accessibility',
  'presentation-pacing',
  'full-audit'
];

/**
 * ─── DECK LLM FUNCTION-CALLING TOOL SCHEMAS ────────────────────────────────────
 * Standard OpenAI / Gemini function calling tool specifications for Deck capabilities.
 */
export const DECK_LLM_TOOL_DEFINITIONS = [
  {
    name: 'deck_create_slide',
    description: 'Creates a new presentation slide with a specified layout, title, and optional preset theme.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title or topic of the slide.' },
        layoutStyle: { type: 'string', enum: DECK_ALLOWED_LAYOUTS, description: 'Layout template for the new slide.' },
        designPresetKey: { type: 'string', enum: DECK_ALLOWED_PRESETS, description: 'Visual preset theme.' },
        headline: { type: 'string', description: 'Main prominent headline text.' },
        blurb: { type: 'string', description: 'Concise descriptive paragraph or subtitle.' },
        bentoCards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              style: { type: 'string', enum: ['glass', 'frosted', 'cyber', 'midnight'] }
            },
            required: ['title', 'description']
          },
          description: 'Optional list of Bento cards to populate on the slide.'
        }
      },
      required: ['title']
    }
  },
  {
    name: 'deck_delete_slide',
    description: 'Deletes a presentation slide by its slide ID.',
    parameters: {
      type: 'object',
      properties: {
        slideId: { type: 'number', description: 'Numeric ID of the slide to remove.' }
      },
      required: ['slideId']
    }
  },
  {
    name: 'deck_duplicate_slide',
    description: 'Duplicates an existing slide, copying all layout elements, vectors, and content.',
    parameters: {
      type: 'object',
      properties: {
        slideId: { type: 'number', description: 'ID of the slide to duplicate.' }
      },
      required: ['slideId']
    }
  },
  {
    name: 'deck_reorder_slides',
    description: 'Moves a slide from one index position to another in the presentation hierarchy.',
    parameters: {
      type: 'object',
      properties: {
        sourceIndex: { type: 'number', description: '0-based source index.' },
        destinationIndex: { type: 'number', description: '0-based destination index.' }
      },
      required: ['sourceIndex', 'destinationIndex']
    }
  },
  {
    name: 'deck_update_slide',
    description: 'Updates content, typography, or styling fields on a specific slide (or the active slide if slideId omitted).',
    parameters: {
      type: 'object',
      properties: {
        slideId: { type: 'number', description: 'Target slide ID. Defaults to active slide if omitted.' },
        title: { type: 'string', description: 'Slide title' },
        headline: { type: 'string', description: 'Main headline text' },
        tagline: { type: 'string', description: 'Top eyebrow / tagline' },
        blurb: { type: 'string', description: 'Body description text' },
        backgroundColor: { type: 'string', description: 'Slide background color or gradient' },
        footerLocation: { type: 'string', description: 'Footer location label' }
      }
    }
  },
  {
    name: 'deck_add_bento_card',
    description: 'Adds an executive Apple-style translucent glass Bento card to the active slide.',
    parameters: {
      type: 'object',
      properties: {
        slideId: { type: 'number', description: 'Target slide ID.' },
        title: { type: 'string', description: 'Bento card title.' },
        description: { type: 'string', description: 'Bento card text content.' },
        style: { type: 'string', enum: ['glass', 'frosted', 'cyber', 'midnight'], description: 'Visual surface style.' },
        posX: { type: 'number', description: 'Canvas X position (0 to 900).' },
        posY: { type: 'number', description: 'Canvas Y position (0 to 600).' },
        width: { type: 'number', description: 'Card width in pixels (e.g. 260).' },
        height: { type: 'number', description: 'Card height in pixels (e.g. 190).' }
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'deck_update_bento_card',
    description: 'Updates properties or content of an existing Bento card.',
    parameters: {
      type: 'object',
      properties: {
        cardId: { type: 'string', description: 'ID of the target Bento card.' },
        title: { type: 'string', description: 'Updated card title.' },
        description: { type: 'string', description: 'Updated card description.' },
        bg: { type: 'string', description: 'Custom background styling.' }
      },
      required: ['cardId']
    }
  },
  {
    name: 'deck_delete_bento_card',
    description: 'Removes a Bento card from the active slide.',
    parameters: {
      type: 'object',
      properties: {
        cardId: { type: 'string', description: 'ID of the card to delete.' }
      },
      required: ['cardId']
    }
  },
  {
    name: 'deck_convert_shape_to_bento',
    description: 'Converts a standard geometric container or shape into a structured translucent Bento card.',
    parameters: {
      type: 'object',
      properties: {
        shapeId: { type: 'string', description: 'ID of the shape to convert.' }
      },
      required: ['shapeId']
    }
  },
  {
    name: 'deck_add_shape',
    description: 'Adds a vector shape, heading, textbox, pill, or badge onto the active slide canvas.',
    parameters: {
      type: 'object',
      properties: {
        shapeType: { type: 'string', enum: DECK_ALLOWED_SHAPE_TYPES, description: 'Type of shape to insert.' },
        text: { type: 'string', description: 'Inner text for heading, textbox, pill, or badge.' },
        posX: { type: 'number', description: 'Canvas X position.' },
        posY: { type: 'number', description: 'Canvas Y position.' },
        width: { type: 'number', description: 'Shape width.' },
        height: { type: 'number', description: 'Shape height.' },
        color: { type: 'string', description: 'Text or fill color.' },
        fillType: { type: 'string', enum: ['solid', 'glass', 'gradient', 'transparent'] }
      },
      required: ['shapeType']
    }
  },
  {
    name: 'deck_update_shape',
    description: 'Updates position, size, text, or visual styling of a shape on the active slide.',
    parameters: {
      type: 'object',
      properties: {
        shapeId: { type: 'string', description: 'ID of the shape to update.' },
        updates: { type: 'object', description: 'Key-value map of properties to update.' }
      },
      required: ['shapeId', 'updates']
    }
  },
  {
    name: 'deck_delete_shape',
    description: 'Deletes a shape from the slide.',
    parameters: {
      type: 'object',
      properties: {
        shapeId: { type: 'string', description: 'ID of the shape to delete.' }
      },
      required: ['shapeId']
    }
  },
  {
    name: 'deck_set_theme',
    description: 'Applies a visual preset, color palette, or background theme across one slide or the entire deck.',
    parameters: {
      type: 'object',
      properties: {
        presetKey: { type: 'string', enum: DECK_ALLOWED_PRESETS, description: 'Design preset key.' },
        brandKitKey: { type: 'string', description: 'Brand Kit key (e.g. "tech-futuristic", "executive-slate").' },
        applyToAllSlides: { type: 'boolean', description: 'Whether to apply theme across all slides in the deck.' }
      }
    }
  },
  {
    name: 'deck_set_vector_wave',
    description: 'Configures the 3D spline wave decoration (style, colors, glow, opacity, visibility) for the active slide.',
    parameters: {
      type: 'object',
      properties: {
        waveStyle: { type: 'string', enum: DECK_ALLOWED_WAVE_STYLES, description: 'Wave geometric pattern.' },
        color1: { type: 'string', description: 'Primary gradient color hex (e.g. "#00f0ff").' },
        color2: { type: 'string', description: 'Secondary gradient color hex (e.g. "#7c4dff").' },
        glow: { type: 'string', enum: DECK_ALLOWED_WAVE_GLOWS, description: 'Glow effect.' },
        opacity: { type: 'number', description: 'Opacity from 0.0 to 1.0.' },
        hidden: { type: 'boolean', description: 'Whether to hide the background spline.' }
      }
    }
  },
  {
    name: 'deck_run_audit',
    description: 'Runs real-time diagnostic checks across Story Structure, Content Quality, Visual Hierarchy, Accessibility, Pacing, or Full AI Audit.',
    parameters: {
      type: 'object',
      properties: {
        metric: { type: 'string', enum: DECK_ALLOWED_AUDIT_METRICS, description: 'Diagnostic dimension to evaluate.' }
      },
      required: ['metric']
    }
  },
  {
    name: 'deck_apply_audit_polish',
    description: 'Applies automated executive polish to improve typography ratios, balance whitespace, standardize contrast, and align narrative arc.',
    parameters: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['active-slide', 'entire-deck'], description: 'Scope of polish.' }
      }
    }
  },
  {
    name: 'deck_toggle_presentation',
    description: 'Toggles full presentation mode or controls 16:9 proportional fit vs edge-to-edge screen fill.',
    parameters: {
      type: 'object',
      properties: {
        active: { type: 'boolean', description: 'Set true to enter presentation, false to exit.' },
        fillScreen: { type: 'boolean', description: 'Set true to expand canvas to 100vw/100vh screen fill.' }
      }
    }
  },
  {
    name: 'deck_get_state',
    description: 'Retrieves the complete current state of the slide deck, including all slides, active slide metadata, shape count, and diagnostics.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
];

/**
 * ─── DETERMINISTIC DISPATCHER FOR DECK TOOLS ───────────────────────────────────
 * Dispatches LLM tool calls directly to window.regaarderDeck with error boundaries and validation.
 */
export const dispatchDeckToolCall = async (toolName, args = {}, context = {}) => {
  if (typeof window === 'undefined' || !window.regaarderDeck) {
    return {
      success: false,
      error: 'Deck API runtime is not initialized in the active workspace.'
    };
  }

  const deck = window.regaarderDeck;

  try {
    switch (toolName) {
      case 'deck_create_slide': {
        const newSlide = deck.createSlide(args);
        return {
          success: true,
          action: 'created_slide',
          slideId: newSlide?.id,
          message: `Created slide "${args.title || 'Untitled'}" with layout "${args.layoutStyle || 'Title Slide'}"`
        };
      }

      case 'deck_delete_slide': {
        const res = deck.deleteSlide(args.slideId);
        return {
          success: !!res,
          action: 'deleted_slide',
          slideId: args.slideId
        };
      }

      case 'deck_duplicate_slide': {
        const dup = deck.duplicateSlide(args.slideId);
        return {
          success: !!dup,
          action: 'duplicated_slide',
          newSlideId: dup?.id
        };
      }

      case 'deck_reorder_slides': {
        deck.reorderSlides(args.sourceIndex, args.destinationIndex);
        return {
          success: true,
          action: 'reordered_slides',
          from: args.sourceIndex,
          to: args.destinationIndex
        };
      }

      case 'deck_update_slide': {
        deck.updateSlideFields(args.slideId, args);
        return {
          success: true,
          action: 'updated_slide',
          slideId: args.slideId || deck.getActiveSlide()?.id
        };
      }

      case 'deck_add_bento_card': {
        const card = deck.addBentoCard(args.slideId, args);
        return {
          success: true,
          action: 'added_bento_card',
          cardId: card?.id,
          title: args.title
        };
      }

      case 'deck_update_bento_card': {
        deck.updateBentoCard(args.cardId, args);
        return {
          success: true,
          action: 'updated_bento_card',
          cardId: args.cardId
        };
      }

      case 'deck_delete_bento_card': {
        deck.deleteBentoCard(args.cardId);
        return {
          success: true,
          action: 'deleted_bento_card',
          cardId: args.cardId
        };
      }

      case 'deck_convert_shape_to_bento': {
        const bento = deck.convertShapeToBento(args.shapeId);
        return {
          success: true,
          action: 'converted_shape_to_bento',
          cardId: bento?.id
        };
      }

      case 'deck_add_shape': {
        const shape = deck.addShape(args);
        return {
          success: true,
          action: 'added_shape',
          shapeId: shape?.id,
          shapeType: args.shapeType
        };
      }

      case 'deck_update_shape': {
        deck.updateShape(args.shapeId, args.updates);
        return {
          success: true,
          action: 'updated_shape',
          shapeId: args.shapeId
        };
      }

      case 'deck_delete_shape': {
        deck.deleteShape(args.shapeId);
        return {
          success: true,
          action: 'deleted_shape',
          shapeId: args.shapeId
        };
      }

      case 'deck_set_theme': {
        deck.setTheme(args);
        return {
          success: true,
          action: 'set_theme',
          presetKey: args.presetKey,
          brandKitKey: args.brandKitKey
        };
      }

      case 'deck_set_vector_wave': {
        deck.setVectorWave(args);
        return {
          success: true,
          action: 'set_vector_wave',
          waveStyle: args.waveStyle
        };
      }

      case 'deck_run_audit': {
        const audit = deck.runAudit(args.metric);
        return {
          success: true,
          action: 'ran_audit',
          metric: args.metric,
          results: audit
        };
      }

      case 'deck_apply_audit_polish': {
        deck.applyAuditPolish(args.scope || 'active-slide');
        return {
          success: true,
          action: 'applied_audit_polish',
          scope: args.scope || 'active-slide'
        };
      }

      case 'deck_toggle_presentation': {
        deck.togglePresentation(args.active, args.fillScreen);
        return {
          success: true,
          action: 'toggled_presentation',
          active: args.active,
          fillScreen: args.fillScreen
        };
      }

      case 'deck_get_state': {
        const state = deck.getState();
        return {
          success: true,
          action: 'got_state',
          state
        };
      }

      default:
        return {
          success: false,
          error: `Unknown Deck tool action "${toolName}".`
        };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Execution failed during Deck tool call'
    };
  }
};
