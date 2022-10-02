const shouldArticleBePublished = (article) => {
  const { scheduledAt, savedDraft } = article;
  if (!scheduledAt && !savedDraft) return true;
  if (scheduledAt && new Date(scheduledAt) < new Date()) return true;
  if (!savedDraft) return true;
  return false;
};

exports.shouldArticleBePublished = shouldArticleBePublished;
