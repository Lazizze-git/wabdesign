import { t } from "../../i18n";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { matchesToken } from "../../engine/token-names";
import { TOKEN_GROUPS, type TokenGroupDefinition } from "../../engine/token-kinds";
import { removeWhere } from "../../state/changes";
import { externalTokens, siteTokens, tokenTarget, type ClassifiedToken } from "../../state/tokens";
import { Icon } from "../icons";
import { TokenRow } from "./TokenRow";

const PREVIEW_COUNT = 8;
const CLOSED_BY_DEFAULT = new Set(["other", "layout", "external"]);

/** Variables qui ne viennent pas du site (extensions du navigateur, bibliothèques) : rangées à part. */
const EXTERNAL_GROUP: TokenGroupDefinition = {
  id: "external",
  title: "kind.external",
  kinds: TOKEN_GROUPS.flatMap((group) => group.kinds),
};

interface GroupProps {
  group: TokenGroupDefinition;
  tokens: ClassifiedToken[];
  searching: boolean;
  hint?: string;
}

function TokenGroup({ group, tokens, searching, hint }: GroupProps): JSX.Element {
  const [open, setOpen] = useState(!CLOSED_BY_DEFAULT.has(group.id));
  const [showAll, setShowAll] = useState(false);
  const expanded = open || searching;
  const shown = showAll || searching ? tokens : tokens.slice(0, PREVIEW_COUNT);
  const reset = (): void => {
    const selectors = new Set(tokens.map((token) => `${tokenTarget(token).selector}|${token.name}`));
    removeWhere((change) => change.group === "vars" && selectors.has(`${change.target.selector}|${change.property}`));
  };

  return (
    <section class="section">
      <div class="section-head" style={expanded ? undefined : "margin:0"}>
        <button type="button" class="icon-btn sm" aria-expanded={expanded} onClick={() => setOpen(!open)} aria-label={expanded ? t("fonts.collapse") : t("fonts.expand")}>
          <Icon name={expanded ? "minimize" : "plus"} size={14} />
        </button>
        <span class="section-title">{t(group.title)}</span>
        <span class="muted">{tokens.length}</span>
        {expanded && (
          <button type="button" class="btn btn-ghost" onClick={reset}>
            {t("common.reset")}
          </button>
        )}
      </div>
      {expanded && hint && <p class="hint">{hint}</p>}
      {expanded && (
        <div class="stack">
          {shown.map((token) => (
            <TokenRow key={token.name} token={token} />
          ))}
          {!showAll && !searching && tokens.length > PREVIEW_COUNT && (
            <button type="button" class="btn btn-ghost btn-block" onClick={() => setShowAll(true)}>
              {t("system.showAll", { n: tokens.length })}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** Toutes les variables du site, rangées par familles, modifiables en direct. */
export function TokensSection(): JSX.Element {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const tokens = siteTokens.value.filter((token) => matchesToken(token.name, search));
  const foreign = externalTokens.value.filter((token) => matchesToken(token.name, search));
  const foreignGroup = foreign.length > 0 && (
    <TokenGroup group={EXTERNAL_GROUP} tokens={foreign} searching={false} hint={t("system.externalHint")} />
  );

  if (siteTokens.value.length === 0) {
    return (
      <>
        <section class="section">
          <p class="hint" style="margin:0">{t("system.noTokens")}</p>
        </section>
        {foreignGroup}
      </>
    );
  }

  return (
    <>
      <section class="section stack">
        <p class="hint" style="margin:0">{t("system.tokensHint", { n: siteTokens.value.length })}</p>
        <input class="input" placeholder={t("system.search")} value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
      </section>
      {TOKEN_GROUPS.map((group) => {
        const items = tokens.filter((token) => group.kinds.includes(token.kind));
        if (items.length === 0) return null;
        return <TokenGroup key={group.id} group={group} tokens={items} searching={search !== ""} />;
      })}
      {tokens.length === 0 && <p class="empty">{t("system.noMatch")}</p>}
      {foreignGroup}
    </>
  );
}
