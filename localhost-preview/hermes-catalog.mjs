// Public navigation metadata and representative fixtures. Live catalogs remain Hermes-owned.
export const providers = [
 ['local','Local LLM','Local'],['openai','OpenAI','Cloud'],['anthropic','Anthropic','Cloud'],['google','Google Gemini','Cloud'],['xai','Grok / xAI','Cloud'],['nous','Nous Portal','Cloud'],['openrouter','OpenRouter','Router'],['deepseek','DeepSeek','Cloud'],['mistral','Mistral','Cloud'],['groq','Groq','Cloud'],['fireworks','Fireworks AI','Cloud'],['together','Together AI','Cloud'],['cerebras','Cerebras','Cloud'],['minimax','MiniMax','Cloud'],['moonshot','Moonshot / Kimi','Cloud'],['zai','Z.ai','Cloud'],['nvidia','NVIDIA','Cloud'],['huggingface','Hugging Face','Cloud'],['azure','Azure OpenAI','Cloud'],['bedrock','Amazon Bedrock','Cloud'],['ollama','Ollama','Local'],['lmstudio','LM Studio','Local'],['custom','Custom endpoint','Custom']
].map(([id,name,kind])=>({id,name,kind}))
const section=(id,name,children,param='page')=>({id,name,param,children:children.map(([id,name,summary])=>({id,name,summary}))})
export const settingsSections = [
 section('config:model','Model',[
  ['main','Main model','Provider, main model, context length, reasoning effort and service tier.'],['fallbacks','Fallback models','Ordered fallback providers and models when the primary provider fails.'],['auxiliary','Auxiliary models','Models for compression, vision, web extraction and other supporting tasks.'],['moa','Mixture of Agents','Parallel model contributors and their synthesis configuration.']]),
 section('config:chat','Chat',[['behavior','Behavior','Personality, timezone and reasoning display.'],['attachments','Attachments','Image inputs and attachment behavior.']]),
 section('config:appearance','Appearance',[['general','General','Language and appearance preferences.'],['theme','Theme','NaCLip themes and widget packs.'],['typography','Typography','Chat and interface typography.'],['window-layout','Window & layout','Pane placement, HUD and window behavior.'],['chat-display','Chat display','Message density, reasoning and transcript presentation.'],['pet','Pet','Desktop companion preferences.']]),
 section('config:workspace','Workspace',[['projects','Projects & discovery','Working directory and repository discovery.'],['shell','Shell environment','Persistent shell and environment pass-through.'],['files','Files & execution','File reading and code execution settings.']]),
 section('config:safety','Safety',[['approvals','Approvals','Tool approval policies and command allowlists.'],['privacy','Privacy & network','Security and network access policies.'],['checkpoints','Checkpoints','Workspace checkpoints and recovery.']]),
 section('config:browser','Browser',[['profile','Browser profile','Real browser profiles and browser behavior.'],['network','Local & private URLs','Routing for local and private network pages.']]),
 section('vault','Passwords & Logins',[['credentials','Saved credentials','Saved credentials and model-blind browser filling.'],['sources','Password managers','Password manager integration.']]),
 section('config:memory','Memory & Context',[['persistent','Persistent memory','Persistent memory providers and configuration.'],['context','Context & compression','Context limits, compression and memory injection.']]),
 section('config:voice','Voice',[['conversation','Voice conversation','Voice mode and recording preferences.'],['transcription','Speech to text','Transcription providers and languages.'],['speech','Text to speech','Speech provider, voice and playback.']]),
 section('config:advanced','Advanced',[['desktop','Desktop & startup','Startup and desktop update preferences.'],['runtime','Agent limits','Turn limits and retry behavior.'],['tools','Tool access','Toolsets and enforcement.'],['terminal','Terminal backend','Local, Docker, SSH and other terminal backends.'],['delegation','Subagents','Delegation and subagent settings.'],['output','Output limits','Tool output limits and checkpoints.']]),
 section('notifications','Notifications',[['alerts','Desktop alerts','Desktop notifications and alert behavior.'],['sounds','Sounds','Notification sound preferences.']]),
 section('billing','Billing',[['overview','Overview','Account, usage and billing overview.'],['plans','Plans','Plans when available for the signed-in account.']],'bview'),
 section('providers','Providers',[['accounts','Accounts','Provider sign-in and connected accounts.'],['keys','API keys','Provider credentials managed by Hermes.'],['custom-endpoints','Custom Endpoints','Custom compatible model endpoints.'],['local','Local Models','Local runtime, hardware and installed models; availability depends on native launch options.']],'pview'),
 section('gateway','Gateways',[['connection','This window','The local, SSH, URL or cloud backend used by this window.'],['devices','Saved connections','Registered Hermes instances and connection ownership.'],['managed-updates','Remote updates','Managed updates for supported SSH connections.']]),
 section('keybinds','Keyboard Shortcuts',[['shortcuts','Key bindings','Keyboard bindings for desktop commands.'],['hud-gesture','HUD gesture','HUD activation gesture.'],['screen-capture','Screen capture','Screen capture shortcut and behavior.']]),
 section('keys','Tools & Keys',[['tools','Tools','Tool provider credentials and configuration.'],['settings','Settings','Additional environment and integration keys.']],'kview'),
 section('sessions','Sessions',[['archived','Archive & retention','Archived conversations and retention.'],['default-directory','Default project folder','Default directory for new conversations.']]),
 section('about','About',[['updates','Version & updates','Version, diagnostics and managed updates.'],['uninstall','Uninstall','Native uninstall and cleanup controls.']])
]
export function settingsRoute(section,page){const params=new URLSearchParams({tab:section.id,[section.param]:page||section.children[0].id});return '/settings?'+params}
export function resolveSettings(route){const params=new URLSearchParams(route.split('?')[1]);let tab=params.get('tab')||'config:appearance';if(tab==='connections')tab='gateway';if(tab==='model'||tab==='appearance')tab='config:'+tab;const section=settingsSections.find(s=>s.id===tab)||settingsSections[2];const page=section.children.find(p=>p.id===params.get(section.param))||section.children[0];return {section,page}}
const tool=(id,name,category,description,names,enabled=true)=>({id,name,category,description,tools:names.split(',').filter(Boolean),source:'Built In',enabled})
export const toolFixtures=[
 tool('file','File Operations','Development','Read, write, patch and search workspace files.','read_file,write_file,patch,search_files'),
 tool('terminal','Terminal & Processes','Development','Run terminal commands and manage processes.','terminal,process'),
 tool('browser','Browser Automation','Web & browser','Navigate, click, type and inspect browser pages.','browser_navigate,browser_click,browser_type,browser_scroll'),
 tool('web','Web Search & Scraping','Web & browser','Search the web and extract page content.','web_search,web_extract'),
 tool('skills','Skills','Productivity','Find, read and manage agent skills.','skill_list,skill_view,skill_manage'),
 tool('vision','Vision / Image Analysis','Media','Analyze images using a vision-capable model.','vision_analyze'),
 tool('code','Code Execution','Development','Execute code through the configured tool backend.','execute_code'),
 tool('computer','Computer Use (macOS/Windows/Linux)','Web & browser','Background desktop control through the computer-use driver.','computer_use'),
 tool('connections','Connections','Integrations','Remote connector tools and account authorization.','connections'),
 tool('cron','Cron Jobs','Productivity','Create, list, pause, resume and run scheduled work.','cronjob'),
 tool('memory','Memory','Productivity','Read and maintain persistent agent memory.','memory'),
 tool('session','Session Search','Productivity','Search past conversations.','session_search'),
 tool('clarify','Clarifying Questions','Productivity','Ask a clarifying question when the task needs it.','clarify'),
 tool('planning','Task Planning','Productivity','Track a task plan and its progress.','todo_list'),
 tool('delegation','Task Delegation','Productivity','Delegate work using existing agent policies.','delegate_task'),
 tool('image','Image Generation','Media','Generate images through the configured provider.','image_generate'),
 tool('stt','Speech-to-Text','Media','Transcribe voice and audio.','speech_to_text'),
 tool('tts','Text-to-Speech','Media','Generate speech through the configured provider.','text_to_speech'),
 tool('video-analysis','Video Analysis','Media','Analyze video with a video-capable model.','video_analyze',false),
 tool('video-generation','Video Generation','Media','Generate video using configured services.','video_generate',false),
 tool('x','X (Twitter) Search','Web & browser','Search X with the configured xAI account or key.','x_search'),
 {...tool('a2a','A2A','Integrations','Agent-to-agent discovery and task exchange.','a2a_discover,a2a_call,a2a_list,a2a_history,a2a_orchestrate',false),source:'Plugin'},
 {...tool('broker','Ai-Task-Broker','Integrations','Submit and inspect tasks through the broker bridge.','task_submit,task_status'),source:'Plugin'},
 tool('home','Home Assistant','Integrations','Smart home device control.','home_assistant',false),
 tool('kanban','Kanban','Productivity','Task boards in Hermes Desktop.','kanban',false),
 tool('spotify','Spotify','Integrations','Playback, search, playlists and library.','spotify',false),
 {...tool('unbrowse','Unbrowse','Web & browser','Website extraction through the installed integration.','unbrowse'),source:'Plugin'}
]
export const skillFixtures=[
 ['apple-notes','Manage Apple Notes: create, search and edit.','Productivity','Built In'],['apple-reminders','Add, list and complete Apple Reminders.','Productivity','Built In'],['findmy','Find Apple devices and AirTags.','Productivity','Built In'],['codex','Delegate coding tasks to OpenAI Codex CLI.','Development','Built In'],['claude-code','Delegate coding tasks to Claude Code CLI.','Development','Built In'],['computer-use','Drive desktop tasks with the computer-use tools.','Web & browser','Built In'],['hermes-agent','Configure, extend and use Hermes Agent.','Development','Built In'],['architecture-diagram','Create architecture diagrams from a design brief.','Creative','Built In'],['imessage','Use the native messaging integration.','Productivity','Built In'],['opencode','Delegate coding tasks to OpenCode CLI.','Development','Built In'],['custom-workflow','A sample user-authored workflow.','Productivity','Local']
].map(([name,description,category,source])=>({id:name,name,description,category,source,enabled:true}))
export const pluginFixtures=[
 {id:'naclip',name:'NaCLip',description:'Your customizable Hermes appearance and navigation skin.',category:'Desktop',source:'Disk',enabled:true},
 {id:'hermes-bots',name:'Hermes Bots',description:'Bot profiles and their canonical chats.',category:'Desktop',source:'Bundled',enabled:true},
 {id:'kanban',name:'Kanban',description:'Task boards inside Hermes Desktop.',category:'Tools',source:'Bundled',enabled:false},
 {id:'quota',name:'Quota',description:'Provider quota and rate-limit status.',category:'Desktop',source:'Community',enabled:false},
 {id:'hermes-memory-ui',name:'Hermes Memory UI',description:'Inspect configured memory providers.',category:'Memory',source:'Community',enabled:false},
 {id:'hindsight',name:'Hindsight',description:'Memory provider integration.',category:'Memory',source:'Community',enabled:false},
 {id:'hermes-speech',name:'Hermes Speech',description:'Speech provider setup and preferences.',category:'Voice',source:'Community',enabled:false},
 {id:'claude-subscription-directsdk',name:'Claude Subscription Direct SDK',description:'Experimental model-provider integration.',category:'Models',source:'Official',enabled:false}
]
export function filterCatalog(rows,{query='',category='all',source='all',status='all',sort='name'}={}) {
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean)
 return rows.filter(r=>(category==='all'||r.category===category)&&(source==='all'||r.source===source)&&(status==='all'||(status==='enabled'?r.enabled:!r.enabled))&&terms.every(q=>[r.name,r.description,r.category,r.source,...(r.tools||[])].join(' ').toLowerCase().includes(q))).sort((a,b)=>sort==='enabled'?Number(b.enabled)-Number(a.enabled)||a.name.localeCompare(b.name):a.name.localeCompare(b.name))
}
