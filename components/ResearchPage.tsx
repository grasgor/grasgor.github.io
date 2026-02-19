
import React from 'react';

const researchProjects = [
  {
    title: 'Self-Supervised World Simulators',
    description: 'Investigating how latent representations can learn the transition dynamics of complex environments without explicit reward signals.',
    tags: ['Dynamics', 'SSL', 'Generative'],
    thumbnail: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Multi-Modal Latent Spaces',
    description: 'Unifying visual, auditory, and tactile modalities into a single world model for robust embodied intelligence.',
    tags: ['Multimodal', 'Embodied AI', 'Sensory'],
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Causal Generative Models',
    description: 'Enabling world models to perform "what-if" counterfactual reasoning by integrating causal graphs into neural simulators.',
    tags: ['Causality', 'Reasoning', 'Graph Nets'],
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'High-Fidelity Neural Rendering',
    description: 'Advancing Gaussian Splatting and NeRF architectures for real-time 3D reconstruction within world model simulators.',
    tags: ['3D Vision', 'NeRF', 'Real-time'],
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
  },
];

const ResearchPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-16 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-4 uppercase">Research</h1>
        <p className="text-xl text-slate-500 font-light mb-16 max-w-2xl border-l-4 border-blue-500 pl-6">
          Architecting foundational systems that understand and predict the state of the world through generative modeling.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {researchProjects.map((project, index) => (
            <div key={index} className="group border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
               <div className="h-48 overflow-hidden">
                 <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
               </div>
              <div className="p-6">
                <h2 className="text-lg font-black text-slate-900 mb-3 leading-tight">{project.title}</h2>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-sm uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;
