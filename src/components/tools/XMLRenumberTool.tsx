import { useState, useCallback } from "react";
import { Search, RefreshCw, Copy, FileText, CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProcessingHistory } from "@/hooks/useProcessingHistory";

interface MappingItem {
  oldLabel: string;
  uniqueId: string;
  newLabel: string;
}

export function XMLRenumberTool() {
  const [inputXml, setInputXml] = useState("");
  const [outputXml, setOutputXml] = useState("");
  const [prefix, setPrefix] = useState("[");
  const [suffix, setSuffix] = useState("]");
  const [stats, setStats] = useState("");
  const [mappingReport, setMappingReport] = useState<MappingItem[]>([]);
  const [lastProcessingStats, setLastProcessingStats] = useState<{ found: number; renumbered: number } | null>(null);
  
  const { user } = useAuth();
  const { saveToHistory } = useProcessingHistory();

  const sampleData = `<article>
    <sections>
        <p>This is the first sentence that cites reference [26]. A second sentence cites a non-sequential list [<ce:cross-ref id="cf1000" refid="bb0005">26</ce:cross-ref>,<ce:cross-ref id="cf1005" refid="bb0010">27</ce:cross-ref>,<ce:cross-ref id="cf1015" refid="bb0020">4</ce:cross-ref>]. Finally, a complex range citation is used [<ce:cross-refs id="cf3000" refid="bb0010 bb0020 bb0025 bb0030 bb0045 bb0050 bb0070 bb0075 bb0090">27, 4–6, 9, 11, 13</ce:cross-refs>].</p>
    </sections>
    <tail>
        <ce:bibliography id="bi0005">
            <ce:section-title id="st0205">References</ce:section-title>
            <ce:bibliography-sec id="bs0005">
                <ce:bib-reference id="bb0005"><ce:label>[26]</ce:label><sb:reference id="rf0005">...</sb:reference><ce:source-text id="se0045">Y.H. Chiu, T.F.M. Chang (New Ref 1)</ce:source-text></ce:bib-reference>
                <ce:bib-reference id="bb0010"><ce:label>[27]</ce:label><sb:reference id="rf0010">...</sb:reference><ce:source-text id="se0050">A. Kumar, G. Pandey (New Ref 2)</ce:source-text></ce:bib-reference>
                <ce:bib-reference id="bb0015"><ce:label>[3]</ce:label><sb:reference id="rf0015">...</sb:reference><ce:source-text id="se0055">S. Xu, Y. Zhu, L. Jiang (New Ref 3)</ce:source-text></ce:bib-reference>
                <ce:bib-reference id="bb0020"><ce:label>[4]</ce:label><sb:reference id="rf0020">...</sb:reference><ce:source-text id="se0060">M.A. Brown, S.C. De Vito (New Ref 4)</ce:source-text></ce:bib-reference>
                <ce:bib-reference id="bb0025"><ce:label>[5]</ce:label><sb:reference id="rf0025">...</sb:reference><ce:source-text id="se0065">S. Chen, J. Zhang (New Ref 5)</ce:source-text></ce:bib-reference>
            </ce:bibliography-sec>
        </ce:bibliography>
    </tail>
</article>`;

  const collapseRanges = (numbers: number[]): string => {
    if (numbers.length === 0) return "";
    const sorted = [...numbers].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? start.toString() : `${start}–${end}`);
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push(start === end ? start.toString() : `${start}–${end}`);
    return ranges.join(", ");
  };

  const handleScan = useCallback(() => {
    if (!inputXml.trim()) {
      toast.error("Please paste input text first.");
      return;
    }

    const bibRefRegex = /(<ce:bib-reference\s+id="([^"]+)"[^>]*>[\s\S]*?)<ce:label>([\s\S]*?)<\/ce:label>/g;
    let match;
    const report: MappingItem[] = [];
    let counter = 1;

    while ((match = bibRefRegex.exec(inputXml)) !== null) {
      report.push({
        oldLabel: match[3].trim(),
        uniqueId: match[2],
        newLabel: `${prefix}${counter}${suffix}`,
      });
      counter++;
    }

    if (report.length === 0) {
      toast.error("No <ce:bib-reference> tags found.");
      return;
    }

    setMappingReport(report);
    setStats(`Found ${report.length} references`);
    setOutputXml(`Scan Report: ${report.length} bibliography entries found.\n\nMapping Preview:\n${report.map((r, i) => `${i + 1}. ${r.oldLabel} → ${r.newLabel} (ID: ${r.uniqueId})`).join("\n")}`);
    toast.success(`Scan complete: ${report.length} references found`);
  }, [inputXml, prefix, suffix]);

  const handleRenumber = useCallback(() => {
    if (!inputXml.trim()) {
      toast.error("Please paste input text first.");
      return;
    }

    const bibRefRegex = /(<ce:bib-reference\s+id="([^"]+)"[^>]*>[\s\S]*?)<ce:label>([\s\S]*?)<\/ce:label>/g;
    const singleCrossRefRegex = /(<ce:cross-ref[^>]*?refid="([^"]+)"[^>]*?>)([\s\S]*?)(<\/ce:cross-ref>)/g;
    const rangeCrossRefRegex = /(<ce:cross-refs[^>]*?refid="([^"]+)"[^>]*?>)([\s\S]*?)(<\/ce:cross-refs>)/g;

    let counter = 1;
    let bibMatchCount = 0;
    let crossRefMatchCount = 0;
    const referenceMap: Record<string, number> = {};
    const report: MappingItem[] = [];

    // Pass 1: Renumber bibliography labels
    let renumberedText = inputXml.replace(bibRefRegex, (match, prefixGroup, uniqueId, originalLabelContent) => {
      bibMatchCount++;
      const newNumber = counter;
      const newLabel = `${prefix}${newNumber}${suffix}`;
      referenceMap[uniqueId] = newNumber;
      report.push({
        oldLabel: originalLabelContent.trim(),
        uniqueId,
        newLabel,
      });
      counter++;
      return `${prefixGroup}<ce:label>${newLabel}</ce:label>`;
    });

    if (bibMatchCount === 0) {
      toast.error("No <ce:label> tags found within <ce:bib-reference> tags.");
      return;
    }

    // Pass 2.1: Update single cross-references
    renumberedText = renumberedText.replace(singleCrossRefRegex, (match, openTag, refId, content, closeTag) => {
      crossRefMatchCount++;
      const newNumber = referenceMap[refId];
      if (newNumber === undefined) {
        toast.warning(`Cross-reference ID ${refId} not found in bibliography map.`);
        return match;
      }
      return `${openTag}${newNumber}${closeTag}`;
    });

    // Pass 2.2: Update range cross-references
    renumberedText = renumberedText.replace(rangeCrossRefRegex, (match, openTag, refIdsString, content, closeTag) => {
      crossRefMatchCount++;
      const refIds = refIdsString.split(/\s+/);
      const newNumbers: number[] = [];

      for (const refId of refIds) {
        const newNumber = referenceMap[refId];
        if (newNumber !== undefined) {
          newNumbers.push(newNumber);
        }
      }

      if (newNumbers.length === 0) return match;
      const collapsedRange = collapseRanges(newNumbers);
      return `${openTag}${collapsedRange}${closeTag}`;
    });

    setMappingReport(report);
    setOutputXml(renumberedText);
    setStats(`${bibMatchCount} refs, ${crossRefMatchCount} citations updated`);
    setLastProcessingStats({ found: bibMatchCount, renumbered: crossRefMatchCount });
    toast.success("Renumbering complete!");
  }, [inputXml, prefix, suffix]);

  const handleSaveToHistory = useCallback(() => {
    if (!outputXml.trim() || !lastProcessingStats) {
      toast.error("No processed result to save.");
      return;
    }
    
    saveToHistory({
      input_xml: inputXml,
      output_xml: outputXml,
      references_found: lastProcessingStats.found,
      references_renumbered: lastProcessingStats.renumbered,
      prefix,
      suffix,
    });
  }, [inputXml, outputXml, lastProcessingStats, prefix, suffix, saveToHistory]);

  const handleCopy = useCallback(() => {
    if (!outputXml.trim()) return;
    navigator.clipboard.writeText(outputXml);
    toast.success("Copied to clipboard!");
  }, [outputXml]);

  const handleClear = () => {
    setInputXml("");
    setOutputXml("");
    setStats("");
    setMappingReport([]);
  };

  const handleLoadSample = () => {
    setInputXml(sampleData);
    setOutputXml("");
    setMappingReport([]);
    toast.success("Sample loaded");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">XML Reference Sequence Normalizer</h1>
        <p className="text-muted-foreground mt-1">
          Automated two-pass tool to renumber bibliography labels and update all cross-references.
        </p>
      </div>

      {/* Settings */}
      <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
        <h3 className="text-sm font-bold text-warning-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          🏷️ Renumbering Format Settings
        </h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="prefix" className="text-sm font-medium">Prefix:</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              maxLength={5}
              className="w-16 text-center"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="suffix" className="text-sm font-medium">Suffix:</Label>
            <Input
              id="suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              maxLength={5}
              className="w-16 text-center"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            Output Format: <code className="bg-warning/20 px-1.5 py-0.5 rounded text-foreground font-mono font-bold">{prefix}N{suffix}</code>
          </span>
        </div>
      </div>

      {/* Input/Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden flex flex-col">
          <div className="bg-primary/5 px-4 py-3 border-b border-border flex justify-between items-center">
            <label className="font-semibold text-primary flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input XML/SGML
            </label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLoadSample} className="text-xs">
                Load Sample
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground">
                Clear
              </Button>
            </div>
          </div>
          <div className="flex-grow p-4">
            <Textarea
              value={inputXml}
              onChange={(e) => setInputXml(e.target.value)}
              placeholder="Paste text containing <ce:bib-reference> and <ce:cross-ref> tags..."
              className="w-full h-80 font-mono text-sm resize-none"
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden flex flex-col">
          <div className="bg-success/5 px-4 py-3 border-b border-border flex justify-between items-center">
            <label className="font-semibold text-success flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Output / Renumbered XML
            </label>
            {stats && <span className="text-xs text-success font-medium">{stats}</span>}
          </div>
          <div className="flex-grow p-4 relative">
            {mappingReport.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg text-xs max-h-32 overflow-auto">
                <p className="font-semibold mb-2">Mapping Report:</p>
                {mappingReport.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono">{item.oldLabel}</span>
                    <span>→</span>
                    <span className="font-mono text-success">{item.newLabel}</span>
                    <span className="text-muted-foreground/50">({item.uniqueId})</span>
                  </div>
                ))}
                {mappingReport.length > 5 && (
                  <p className="mt-2 text-muted-foreground">...and {mappingReport.length - 5} more</p>
                )}
              </div>
            )}
            <Textarea
              value={outputXml}
              readOnly
              placeholder="Renumbered result or Scan Report will appear here..."
              className="w-full h-80 font-mono text-sm resize-none"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="absolute bottom-8 right-8 rounded-full shadow-lg"
              disabled={!outputXml.trim()}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          onClick={handleScan}
          size="lg"
          variant="secondary"
          className="gap-2 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Search className="h-5 w-5" />
          Scan Sequence Only
        </Button>
        <Button
          onClick={handleRenumber}
          size="lg"
          className="gap-2 px-8 rounded-full gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <RefreshCw className="h-5 w-5" />
          Automated Renumber & Update
        </Button>
        {user && outputXml && lastProcessingStats && (
          <Button
            onClick={handleSaveToHistory}
            size="lg"
            variant="outline"
            className="gap-2 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Save className="h-5 w-5" />
            Save to History
          </Button>
        )}
      </div>

      {/* Info Footer */}
      <div className="border-t border-border pt-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Core Functionality</h3>
        <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
          <li><strong>Pass 1:</strong> Renumbers the &lt;ce:label&gt; tags to be strictly sequential using your specified prefix/suffix.</li>
          <li><strong>Pass 2:</strong> Updates all cross-references to use the new sequential numbers.</li>
          <li>Original IDs are preserved, maintaining the link between citations and references.</li>
          <li><strong>Complex Range Handling:</strong> Automatically collapses numbers into concise range format.</li>
        </ul>
      </div>
    </div>
  );
}
