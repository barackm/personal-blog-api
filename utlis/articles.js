const shouldArticleBePublished = (article) => {
  const { scheduledAt, savedDraft } = article;
  if (!scheduledAt && !savedDraft) return true;
  if (scheduledAt && new Date(scheduledAt) < new Date()) return true;
  if (!savedDraft) return true;
  return false;
};

const isUserAuthorOfArticle = (article, user) => {
  if (article.authorId.toString() === user._id.toString()) return true;
  if (user.isAdmin()) return true;
  return false;
};

module.exports = {
  shouldArticleBePublished,
  isUserAuthorOfArticle,
};
