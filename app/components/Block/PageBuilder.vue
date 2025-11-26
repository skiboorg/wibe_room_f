<template>
  <div id="editor" class="w-full min-h-[600px] border"></div>
</template>

<script setup>

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

let editor = null
let isDataLoaded = false

// Метод для загрузки данных в редактор
const loadData = (data) => {
  if (!editor || !data || isDataLoaded) return

  try {
    console.log('🔄 Загружаем данные в редактор:', data)

    // Загружаем компоненты
    if (data.editor_data && data.editor_data.components) {
      editor.setComponents(data.editor_data.components)
      console.log('✅ Компоненты загружены')
    }

    // Загружаем стили
    if (data.editor_data && data.editor_data.styles) {
      editor.setStyle(data.editor_data.styles)
      console.log('✅ Стили загружены')
    }

    isDataLoaded = true
    console.log('✅ Данные успешно загружены в редактор')

  } catch (error) {
    console.error('❌ Ошибка загрузки данных в редактор:', error)
  }
}

const getEditorData = () => {
  if (!editor) {
    console.warn('Editor not initialized')
    return null
  }
  const htmlWithInlineStyles = editor.runCommand('gjs-get-inlined-html')

  return {
    editor_data: {
      components: editor.getComponents(),
      styles: editor.getCss()
    },
    html_inline: htmlWithInlineStyles,
    //html: editor.getHtml(),
    //css: editor.getCss()
  }
}


const getInlineHTML = () => {
  return editor ? editor.getHtml() : ''
}

defineExpose({
  getEditorData,
  getInlineHTML,
  loadData
})

onMounted(async () => {
  const {default: grapesjs} = await import('grapesjs')
  const { default: newsletterPreset } = await import('grapesjs-preset-newsletter')

  editor = grapesjs.init({
    container: '#editor',
    storageManager: false,
    fromElement: true,
    autorender: true,

    // Улучшенная настройка загрузки изображений
    assetManager: {
      embedAsBase64: true,
      upload: true,
      dropzone: false,
      openAssetsOnDrop: 1,
      modalTitle: 'Менеджер изображений',
      uploadName: 'files',
      multiUpload: true,
      // Допустимые типы файлов
      accept: 'image/*',
      // Максимальный размер файла (5MB)
      maxFileSize: 5000000,
    },

    // Включаем все необходимые плагины
    plugins: [newsletterPreset],

    // Настройки для лучшего UX
    canvas: {
      styles: [
        'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
      ]
    }
  })

  // === КОМПОНЕНТ КНОПКИ С ПОЛНЫМ РЕДАКТИРОВАНИЕМ ===
  editor.DomComponents.addType('custom-button', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        editable: true,
        components: 'Текст кнопки',
        traits: [
          {
            type: 'select',
            name: 'variant',
            label: 'Стиль кнопки',
            options: [
              { value: 'filled', name: 'Желтая' },
              { value: 'black', name: 'Черная' },
              { value: 'white', name: 'Белая' },
              { value: 'outline', name: 'Контурная серая' },
              { value: 'outline_black', name: 'Контурная черная' }
            ],
            changeProp: true
          }
        ],
        style: {
          padding: '12px 24px',
          'border-radius': '8px',
          border: 'none',
          cursor: 'pointer',
          'fontSize': '14px',
          'font-weight': '500',
          'font-family': 'inherit',
          'text-align': 'center',
          display: 'inline-block'
        }
      },
      init() {
        this.on('change:variant', this.updateStyle)
        this.updateStyle()
      },
      updateStyle() {
        const variant = this.get('variant') || 'filled'
        const style = { ...this.getStyle() }

        switch (variant) {
          case 'filled':
            style['background-color'] = '#E9B458'
            style['color'] = '#000000'
            style['border'] = '1px solid #4A452A'
            break
          case 'black':
            style['background-color'] = '#000000'
            style['color'] = '#ffffff'
            style['border'] = '1px solid #000000'
            break
          case 'white':
            style['background-color'] = '#ffffff'
            style['color'] = '#000000'
            style['border'] = '1px solid #ffffff'
            break
          case 'outline':
            style['background-color'] = 'transparent'
            style['color'] = '#000000'
            style['border'] = '1px solid #C6CAD2'
            break
          case 'outline_black':
            style['background-color'] = 'transparent'
            style['color'] = '#000000'
            style['border'] = '1px solid #000000'
            break
        }

        this.setStyle(style)
      }
    }
  })

  // === КОМПОНЕНТ ССЫЛКИ С РЕДАКТИРОВАНИЕМ ===
  editor.DomComponents.addType('custom-link', {
    model: {
      defaults: {
        tagName: 'a',
        draggable: true,
        droppable: true,
        editable: true,
        components: 'Текст ссылки',
        attributes: {
          href: '#',
          target: '_self'
        },
        traits: [
          {
            type: 'text',
            name: 'href',
            label: 'URL ссылки',
            changeProp: true
          },
          {
            type: 'select',
            name: 'target',
            label: 'Открывать в',
            options: [
              {value: '_self', name: 'Текущем окне'},
              {value: '_blank', name: 'Новом окне'}
            ],
            changeProp: true
          }
        ],
        style: {
          'color': '#3b82f6',
          'text-decoration': 'underline',
          'cursor': 'pointer',
          'display': 'inline-block',
          'padding': '2px 4px'
        }
      },

      init() {
        this.listenTo(this, 'change:href', () => {
          this.addAttributes({href: this.get('href') || '#'})
        })
        this.listenTo(this, 'change:target', () => {
          this.addAttributes({target: this.get('target') || '_self'})
        })
      }
    }
  })

  // === УЛУЧШЕННЫЙ КОМПОНЕНТ ИЗОБРАЖЕНИЯ ===
  // editor.DomComponents.addType('custom-image', {
  //   model: {
  //     defaults: {
  //       tagName: 'img',
  //       draggable: true,
  //       droppable: false,
  //       resizable: true,
  //       attributes: {
  //         src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMzNS4zMTM3IDIwIDM4IDIyLjY4NjMgMzggMjZDMzggMjkuMzEzNyAzNS4zMTM3IDMyIDMyIDMyQzI4LjY4NjMgMzIgMjYgMjkuMzEzNyAyNiAyNkMyNiAyMi42ODYzIDI4LjY4NjMgMjAgMzIgMjBaTTMyIDM2QzM5LjczMiAzNiA0NiAzOC42ODUzIDQ2IDQyVjQ2SDE4VjQyQzE4IDM4LjY4NTMgMjQuMjY4IDM2IDMyIDM2WiIgZmlsbD0iIzk0QTBBNyIvPgo8L3N2Zz4K',
  //         alt: 'Изображение'
  //       },
  //       traits: [
  //         {
  //           type: 'text',
  //           name: 'src',
  //           label: 'URL изображения',
  //           changeProp: true
  //         },
  //         {
  //           type: 'text',
  //           name: 'alt',
  //           label: 'Описание',
  //           changeProp: true
  //         },
  //         {
  //           type: 'button',
  //           name: 'upload',
  //           label: 'Загрузить',
  //           text: 'Выбрать файл',
  //           command: 'open-assets'
  //         }
  //       ],
  //       style: {
  //         'max-width': '100%',
  //         'height': 'auto',
  //         'border-radius': '8px',
  //         'display': 'block',
  //         'object-fit': 'cover'
  //       }
  //     },
  //     view: {
  //       events: {
  //         dblclick: 'openAssets'
  //       },
  //
  //       openAssets() {
  //         const editor = this.em;
  //
  //         editor.runCommand('open-assets', {
  //           target: this.model,
  //           types: ['image'],
  //           accept: 'image/*'
  //         });
  //       }
  //     },
  //
  //     init() {
  //       this.listenTo(this, 'change:src', this.updateSrc)
  //       this.listenTo(this, 'change:alt', this.updateAlt)
  //     },
  //
  //     updateSrc() {
  //       const src = this.get('src')
  //       if (src) {
  //         this.addAttributes({src})
  //         // Обновляем предпросмотр
  //         this.view.render()
  //       }
  //     },
  //
  //     updateAlt() {
  //       const alt = this.get('alt')
  //       this.addAttributes({alt: alt || 'Изображение'})
  //     }
  //   }
  // })

  editor.DomComponents.addType('custom-image', {
    model: {
      defaults: {
        tagName: 'img',
        draggable: true,
        droppable: false,
        attributes: {
          src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMzNS4zMTM3IDIwIDM4IDIyLjY4NjMgMzggMjZDMzggMjkuMzEzNyAzNS4zMTM3IDMyIDMyIDMyQzI4LjY4NjMgMzIgMjYgMjkuMzEzNyAyNiAyNkMyNiAyMi42ODYzIDI4LjY4NjMgMjAgMzIgMjBaTTMyIDM2QzM5LjczMiAzNiA0NiAzOC42ODUzIDQ2IDQyVjQ2SDE4VjQyQzE4IDM4LjY4NTMgMjQuMjY4IDM2IDMyIDM2WiIgZmlsbD0iIzk0QTBBNyIvPgo8L3N2Zz4K',
          alt: 'Изображение'
        },
        traits: [
          {
            type: 'text',
            name: 'src',
            label: 'URL изображения',
            changeProp: true
          },
          {
            type: 'text',
            name: 'alt',
            label: 'Описание',
            changeProp: true
          },
          {
            type: 'button',
            name: 'upload',
            label: 'Загрузить',
            text: 'Выбрать файл',
            command: 'open-assets'
          }
        ],
        style: {
          'max-width': '100%',
          'height': 'auto',
          'border-radius': '8px',
          'display': 'block',
          'object-fit': 'cover'
        },
        // Включаем ресайз
        resizable: true,
        // Настройки ресайза
        // Указываем, какие свойства можно изменять при ресайзе
        stylable: ['width', 'height'],
        // Дополнительные настройки ресайза
        'resize-options': {
          step: 1,
          keyWidth: 'width',
          keyHeight: 'height',
          handles: ['tl', 'tr', 'bl', 'br']
        }
      },

      init() {
        this.listenTo(this, 'change:src', this.updateSrc);
        this.listenTo(this, 'change:alt', this.updateAlt);

        this.on('change:style', this.updateStyle);
      },

      updateStyle() {
        // Применяем стили к элементу
        const style = this.getStyle();
        if (this.view && this.view.el) {
          Object.keys(style).forEach(prop => {
            this.view.el.style[prop] = style[prop];
          });
        }
      },

      updateSrc() {
        const src = this.get('src');
        if (src) {
          this.addAttributes({ src });
          this.view.render();
        }
      },

      updateAlt() {
        const alt = this.get('alt');
        this.addAttributes({ alt: alt || 'Изображение' });
      }
    },

    view: {
      // Обработка двойного клика
      events: {
        dblclick: 'onDblClick'
      },

      onDblClick(e) {
        e.preventDefault();
        e.stopPropagation();

        // Открываем модальное окно выбора изображений
        const editor = this.model.em.get('Editor');
        editor.runCommand('open-assets');
      },

      // Инициализация ресайза после рендера
      onRender() {
        const model = this.model;

        // Включаем ресайз если он поддерживается
        if (model.get('resizable')) {
          this.el.style.cursor = 'pointer';

          // Добавляем обработчик изменения размера
          this.listenTo(model, 'change:style', this.onStyleChange);
        }
      },

      onStyleChange() {
        // Обновляем стили при изменении размера
        const style = this.model.getStyle();
        Object.keys(style).forEach(prop => {
          this.el.style[prop] = style[prop];
        });
      }
    }
  });

  // === УЛУЧШЕННЫЙ ТЕКСТОВЫЙ КОМПОНЕНТ ===
  editor.DomComponents.addType('text', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        droppable: true,
        editable: true,
        components: 'Текст',
        traits: [
          {
            type: 'select',
            name: 'tag',
            label: 'HTML тег',
            options: [
              {value: 'div', name: 'Div'},
              {value: 'p', name: 'Paragraph'},
              {value: 'h1', name: 'Heading 1'},
              {value: 'h2', name: 'Heading 2'},
              {value: 'h3', name: 'Heading 3'},
              {value: 'h4', name: 'Heading 4'},
              {value: 'h5', name: 'Heading 5'},
              {value: 'h6', name: 'Heading 6'},
              {value: 'span', name: 'Span'}
            ],
            changeProp: true
          }
        ],
        style: {
          // 'padding': '10px',
          // 'min-height': '50px',
          // 'line-height': '1.5'
        }
      },

      init() {
        this.listenTo(this, 'change:tag', this.updateTag)
      },

      updateTag() {
        const tag = this.get('tag') || 'div'
        this.set('tagName', tag)
      }
    }
  })

  // === УЛУЧШЕННЫЙ КОМПОНЕНТ СЕТКИ ===
  editor.DomComponents.addType('grid-container', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        droppable: true,
        editable: false,
        traits: [
          {
            type: 'select',
            name: 'columns',
            label: 'Колонки',
            options: [
              {value: '1', name: '1 колонка'},
              {value: '2', name: '2 колонки'},
              {value: '3', name: '3 колонки'},
              {value: '4', name: '4 колонки'}
            ],
            changeProp: true
          },
          {
            type: 'number',
            name: 'gap',
            label: 'Отступ между колонками (px)',
            min: 0,
            max: 100,
            changeProp: true
          }
        ],
        style: {
          'display': 'grid',
          'gap': '20px',
          'padding': '20px 0'
        }
      },

      init() {
        this.listenTo(this, 'change:columns', this.updateGrid)
        this.listenTo(this, 'change:gap', this.updateGap)
        this.updateGrid()
      },

      updateGrid() {
        const columns = this.get('columns') || '2'
        const gridTemplateColumns = `repeat(auto-fit, minmax(250px, 1fr))`
        this.setStyle({
          ...this.getStyle(),
          'grid-template-columns': gridTemplateColumns
        })
      },

      updateGap() {
        const gap = this.get('gap') || '20'
        this.setStyle({
          ...this.getStyle(),
          'gap': `${gap}px`
        })
      }
    }
  })

  // === КАСТОМНЫЕ КОМАНДЫ ДЛЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ ===
  editor.Commands.add('open-assets', {
    run(editor, sender, options = {}) {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*'
      fileInput.multiple = false

      fileInput.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          this.uploadImage(editor, file, sender)
        }
      }

      fileInput.click()
    },

    uploadImage(editor, file, sender) {
      const reader = new FileReader()

      reader.onload = (e) => {
        const base64 = e.target.result

        // Если есть выбранный компонент, обновляем его
        const selected = editor.getSelected()
        if (selected && selected.get('type') === 'custom-image') {
          selected.set('src', base64)
          selected.setAttributes({src: base64})
        } else {
          // Иначе создаем новый компонент изображения
          editor.getSelected().append({
            type: 'custom-image',
            attributes: {src: base64, alt: file.name},
            style: {
              'max-width': '100%',
              'height': 'auto',
              'border-radius': '8px'
            }
          })
        }

        editor.AssetManager.add({
          src: base64,
          name: file.name
        })
      }

      reader.readAsDataURL(file)
    }
  })

  // === БЛОКИ ДЛЯ БЛОК-МЕНЕДЖЕРА ===

  // 1. КНОПКИ
  editor.BlockManager.add('button', {
    label: 'Кнопка',
    category: 'Кнопки',
    content: {
      type: 'custom-button',
      components: [
        {
          type: 'text',
          content: 'Кнопка'
        }
      ],
      variant: 'filled'
    }
  });


  // 2. ССЫЛКИ
  editor.BlockManager.add('link-basic', {
    label: 'Текстовая ссылка',
    category: 'Ссылки',
    content: {
      type: 'custom-link',
      components: 'Текст ссылки',
      attributes: {href: '#'}
    }
  })

  // 3. ИЗОБРАЖЕНИЯ
  editor.BlockManager.add('image-basic', {
    label: 'Изображение',
    category: 'Изображения',
    content: {
      type: 'custom-image',
      style: {
        'max-width': '300px',
        'height': 'auto'
      }
    }
  })

  // 4. ТЕКСТОВЫЕ БЛОКИ
  editor.BlockManager.add('text-paragraph', {
    label: 'Текст',
    category: 'Текст',
    content: {
      type: 'text',
      components: 'Текст параграфа. Кликните дважды для редактирования...'
    }
  })

  editor.BlockManager.add('text-heading', {
    label: 'Заголовок',
    category: 'Текст',
    content: {
      type: 'text',
      tagName: 'h2',
      components: 'Заголовок раздела',
      style: {
        'font-size': '24px',
        'font-weight': 'bold',
        'margin': '0 0 16px 0'
      }
    }
  })

  // 5. СЕТКИ
  editor.BlockManager.add('grid-2', {
    label: '2 колонки',
    category: 'Сетки',
    content: {
      type: 'grid-container',
      columns: '2',
      components: [
        {
          type: 'text',
          components: 'Колонка 1',
          style: {
            'padding': '20px',
            'background-color': '#f8fafc',
            'border-radius': '8px',
            'min-height': '100px'
          }
        },
        {
          type: 'text',
          components: 'Колонка 2',
          style: {
            'padding': '20px',
            'background-color': '#f8fafc',
            'border-radius': '8px',
            'min-height': '100px'
          }
        }
      ]
    }
  })

  editor.BlockManager.add('grid-3', {
    label: '3 колонки',
    category: 'Сетки',
    content: {
      type: 'grid-container',
      columns: '3',
      components: [
        {
          type: 'text',
          components: 'Колонка 1',
          style: {
            'padding': '20px',
            'background-color': '#f8fafc',
            'border-radius': '8px',
            'min-height': '100px'
          }
        },
        {
          type: 'text',
          components: 'Колонка 2',
          style: {
            'padding': '20px',
            'background-color': '#f8fafc',
            'border-radius': '8px',
            'min-height': '100px'
          }
        },
        {
          type: 'text',
          components: 'Колонка 3',
          style: {
            'padding': '20px',
            'background-color': '#f8fafc',
            'border-radius': '8px',
            'min-height': '100px'
          }
        }
      ]
    }
  })

  // 6. ГОТОВЫЕ БЛОКИ (полностью редактируемые)
  editor.BlockManager.add('cta-grey', {
    label: 'Серый CTA блок',
    category: 'Готовые блоки',
    content: {
      tagName: 'div',
      draggable: true,
      droppable: true,
      editable: true,
      style: {
        'margin-top': '48px',
        'background-color': '#F1F2F4',
        'padding': '32px',
        'border-radius': '12px',
        'text-align': 'center'
      },
      components: [
        {
          tagName: 'h3',
          draggable: true,
          droppable: true,
          editable: true,
          style: {
            'font-weight': '600',
            'line-height': '130%',
            'margin-bottom': '16px',
            'font-size': '24px',
            'margin': '0 0 16px 0'
          },
          components: {
            type: 'text',
            content: 'Почему так происходит?'
          }
        },
        {
          tagName: 'p',
          draggable: true,
          droppable: true,
          editable: true,
          style: {
            'line-height': '150%',
            'margin-bottom': '24px',
            'font-size': '16px',
            'margin': '0 0 24px 0',
            'color': '#666'
          },
          components: 'Потому что ты продолжаешь действовать без четкого плана и стратегии. Ты веришь, что рост придет сам собой, а на самом деле — ты застряла в бесконечном цикле подготовки.'
        },
        {
          tagName: 'div',
          draggable: true,
          droppable: true,
          editable: true,
          style: {
            'display': 'flex',
            'gap': '16px',
            'justify-content': 'center',
            'flex-wrap': 'wrap'
          },
          components: [
            {
              type: 'custom-button',
              components: [
                {
                  type: 'text',
                  content: 'Кнопка'
                }
              ],
              variant: 'filled'
            },
            {
              type: 'custom-button',
              components: 'Оформить рассрочку',
              variant: 'outline'
            }
          ]
        }
      ]
    }
  })

  // Настройка панели управления для лучшего редактирования
  editor.Panels.addPanel({
    id: 'basic-actions',
    el: '.panel__basic-actions',
    buttons: [
      {
        id: 'visibility',
        active: true,
        className: 'btn-toggle-borders',
        label: 'Toggle Borders',
        command: 'sw-visibility',
        togglable: false
      }
    ]
  })

  console.log('✅ Редактор загружен с полным редактированием и улучшенной работой с изображениями!')
})
</script>

