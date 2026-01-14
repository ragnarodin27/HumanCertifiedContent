import React from 'react';
import { BlockchainReceipt as BlockchainReceiptType } from '../types';
import { Link, Box, Clock, ShieldCheck, Copy } from 'lucide-react';

interface BlockchainReceiptProps {
  receipt: BlockchainReceiptType;
}

export const BlockchainReceipt: React.FC<BlockchainReceiptProps> = ({ receipt }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-slate-900 text-slate-300 rounded-xl overflow-hidden border border-slate-700 w-full font-mono text-sm">
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>ON-CHAIN RECORD</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-500 uppercase tracking-wider">{receipt.status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Content Hash */}
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
            <Box className="w-3 h-3" /> Content Hash (SHA-256)
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded border border-slate-700/50 group">
             <code className="break-all text-xs text-slate-200">{receipt.contentHash}</code>
             <button 
                onClick={() => copyToClipboard(receipt.contentHash)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-white"
                title="Copy Hash"
             >
               <Copy className="w-3 h-3" />
             </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            This hash is mathematically derived from your content. Any change to the text will produce a different hash.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
              <Link className="w-3 h-3" /> Transaction ID
            </div>
            <div className="text-xs text-blue-300 truncate" title={receipt.transactionHash}>
              {receipt.transactionHash}
            </div>
          </div>
          
          <div>
             <div className="text-xs uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
              <Box className="w-3 h-3" /> Block Height
            </div>
            <div className="text-xs text-slate-200">
              #{receipt.blockHeight.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
           <div className="flex items-center gap-1.5 text-slate-500">
             <Clock className="w-3 h-3" />
             {new Date(receipt.timestamp).toLocaleString()}
           </div>
           <div className="text-slate-500">
             Network: <span className="text-slate-300 font-semibold">{receipt.network}</span>
           </div>
        </div>

      </div>
      
      {/* Footer / Explorer Link Mock */}
      <div className="bg-slate-950 p-3 text-center border-t border-slate-800">
         <a href="#" className="text-xs text-blue-500 hover:text-blue-400 hover:underline flex items-center justify-center gap-1">
            View on Block Explorer (Simulation) <Link className="w-3 h-3" />
         </a>
      </div>
    </div>
  );
};