/** 重写后的整页（recipes/pages/）能正常交互：没有脚本错误，场景切换、筛选分页、保存条都在 */
import { expect, test } from '@playwright/test';

test('控制台：场景切换、图表切换范围、列表筛选翻页、设置改动浮出保存条', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on(
    'response',
    (r) =>
      r.status() >= 400 &&
      !r.url().endsWith('/favicon.ico') &&
      errors.push(`${r.status()} ${r.url()}`),
  );
  await page.goto('/recipes/pages/console.html#overview');

  // 图表：切到 30 天，横轴标签跟着变
  await page.locator('#rangeSeg [data-value="30d"]').click();
  await expect(page.locator('#chart [data-part="axis-x"] span').first()).toHaveText('11/01');

  // 列表：翻到第 2 页，再按状态筛选
  await page.locator('.bd-rail [data-go="list"]').click();
  await expect(page.locator('[data-scene="list"]')).toBeVisible();
  await page.locator('#pager [data-p="2"]').first().click();
  await expect(page.locator('#pageInfo')).toHaveText('显示 11–20，共 24 个');
  await page.locator('#statusSeg [data-value="warn"]').click();
  await expect(page.locator('#tbody tr')).toHaveCount(2);

  // 勾选一行：批量操作栏展开
  await page.locator('#tbody tr').first().locator('td').nth(3).click();
  await expect(page.locator('.bd-bulk [data-part="count"]')).toHaveText('1');

  // 设置：关掉一个开关，保存条浮出；放弃后收起
  await page.locator('.bd-rail [data-go="settings"]').click();
  await expect(page.locator('#savebar')).toBeHidden();
  await page.locator('#sec-notify .bd-switch').first().click();
  await expect(page.locator('#savebar')).toBeVisible();
  await expect(page.locator('#savebar [data-part="text"]')).toHaveText('有 1 项未保存的更改');
  await page.locator('#discard').click();
  await expect(page.locator('#savebar')).toBeHidden();
  await expect(page.locator('#sec-notify .bd-switch').first()).toHaveAttribute(
    'aria-checked',
    'true',
  );

  // 新建实例：弹窗创建后回到列表，入门进度变成 2/3
  await page.locator('.bd-rail [data-go="start"]').click();
  await page.locator('#stepCreate [data-bd-open="createModal"]').click();
  await page.locator('#newName').fill('checkout');
  await page.locator('#createBtn').click();
  await expect(page.locator('[data-scene="list"]')).toBeVisible();
  await expect(page.locator('#startCount')).toHaveText('2/3');

  expect(errors).toEqual([]);
});

test('协作：看板推进、收件箱筛选已读、日程选中、技能展开、动态筛选、权限开关', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on(
    'response',
    (r) =>
      r.status() >= 400 &&
      !r.url().endsWith('/favicon.ico') &&
      errors.push(`${r.status()} ${r.url()}`),
  );
  await page.goto('/recipes/pages/team.html#board');

  // 看板：把评审中的卡片推进到已完成，评审列清空、出现空状态
  const card = page.locator('[data-col="review"] [data-pattern="kanban-card"]');
  await card.hover();
  await card.locator('[data-part="move"]').click();
  await expect(page.locator('#cnt-done')).toHaveText('1');
  await expect(page.locator('[data-col="review"] .bd-empty')).toBeVisible();
  await expect(
    page.locator('[data-col="done"] [data-pattern="kanban-card"] [data-part="done"]'),
  ).toBeVisible();

  // 收件箱：选中第二条，阅读区跟着换；全部标为已读后「未读」筛选是空状态
  await page.locator('.bd-rail [data-go="inbox"]').click();
  await page.locator('#msgList [data-pattern="message"]').nth(1).click();
  await expect(page.locator('#reader [data-part="subject"]')).toHaveText('api-gateway-01 部署失败');
  await page.locator('#markAllBtn').click();
  await expect(page.locator('#railInbox')).toBeHidden();
  await page.locator('#inboxSeg [data-value="unread"]').click();
  await expect(page.locator('#msgList .bd-empty')).toBeVisible();
  await page.locator('#msgList [data-show-all]').click();
  await expect(page.locator('#msgList [data-pattern="message"]')).toHaveCount(8);

  // 日程：点周视图里的日程块，「下一个」卡变成已选
  await page.locator('.bd-rail [data-go="schedule"]').click();
  await page.locator('#calBody button').first().click();
  await expect(page.locator('#nextCard .bd-pill')).toHaveText('已选 · 周一 23 日');

  // 成员资料：展开技能、筛选动态、切换权限；底部文字链接只弹提示不跳转
  await page.locator('.bd-rail [data-go="profile"]').click();
  await page.locator('#tagMore').click();
  await expect(page.locator('#tagMore')).toHaveText('收起');
  await page.locator('#actSeg [data-value="talk"]').click();
  await expect(page.locator('#timeline small[data-wrap]').first()).toBeVisible();
  await page.locator('#perms .bd-switch').nth(3).click();
  await expect(page.locator('#permTag')).toHaveText('已开启 4 / 6');
  await page.locator('[data-part="foot"] > a[data-part="link"]').click();
  await expect(page.locator('[data-scene="profile"]')).toBeVisible();

  expect(errors).toEqual([]);
});

test('文档：帮助中心搜索、文章反馈与阅读进度、更新日志筛选、搜索筛选与空状态', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on(
    'response',
    (r) =>
      r.status() >= 400 &&
      !r.url().endsWith('/favicon.ico') &&
      errors.push(`${r.status()} ${r.url()}`),
  );
  // 右栏（产品筛选、最近搜索）在 ≤1280 时收起，按参考页宽度打开
  await page.setViewportSize({ width: 1380, height: 900 });
  await page.goto('/recipes/pages/docs.html#help');

  // 帮助中心：30 天可用性条画出来；点热门搜索词跳到搜索页并带上关键词
  await expect(page.locator('[data-pattern="uptime"] > li')).toHaveCount(4);
  await expect(page.locator('[data-pattern="uptime"] > li').first().locator('i')).toHaveCount(30);
  await page.locator('[data-flow="wrap"] [data-q="回滚"]').click();
  await expect(page.locator('[data-scene="search"]')).toBeVisible();
  await expect(page.locator('#docSearch')).toHaveValue('回滚');
  await expect(page.locator('#recentList [data-rq="回滚"]')).toBeVisible();

  // 分类卡进入文章；「没帮助」展开反馈表单，提交后收起
  await page.locator('.bd-rail [data-go="help"]').click();
  await page.locator('[data-pattern="category-card"] > .bd-tile').first().click();
  await expect(page.locator('[data-scene="article"]')).toBeVisible();
  await page.locator('#feedback [data-fb="down"]').click();
  await expect(page.locator('#feedback [data-fb="down"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#fbForm')).toBeVisible();
  await page.locator('#fbText').fill('缺少注册商截图');
  await page.locator('#fbForm [type="submit"]').click();
  await expect(page.locator('#fbForm')).toBeHidden();
  await expect(page.locator('#fbTitle')).toHaveText('反馈已发送');

  // 阅读进度：滚到文末后显示已读完
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect(page.locator('#readLeft')).toHaveText('已读完');

  // 更新日志：只看修复，导语和亮点收起，计数变成 n / 总数
  await page.locator('.bd-rail [data-go="changelog"]').click();
  await page.locator('#clSeg [data-value="fix"]').click();
  await expect(
    page.locator('#clList [data-pattern="release"]').first().locator('[data-part="lead"]'),
  ).toBeHidden();
  await expect(page.locator('#clList [data-tag="feat"]').first()).toBeHidden();
  await expect(page.locator('#clList [data-count]').first()).toHaveText('2 / 7 项');
  await page.locator('#clSeg [data-value="all"]').click();
  await expect(page.locator('#clList [data-part="actions"]')).toBeVisible();

  // 搜索：勾选产品筛选后结果变少；关键词搜不到时出现空状态，推荐词可以点
  await page.locator('.bd-rail [data-go="search"]').click();
  await page.locator('#docSearch').fill('域名');
  const results = page.locator('#srWrap .bd-item');
  const all = await results.count();
  await page.locator('#productChips label').filter({ hasText: 'API' }).click();
  await expect(page.locator('#productChips input[data-p="API"]')).toBeChecked();
  expect(await results.count()).toBeLessThan(all);
  await page.locator('#clearProducts').click();
  await expect(results).toHaveCount(all);
  await page.locator('#docSearch').fill('不存在的关键词');
  await expect(page.locator('#srWrap .bd-empty')).toBeVisible();
  await page.locator('#srWrap .bd-empty [data-q="发票"]').click();
  await expect(page.locator('#docSearch')).toHaveValue('发票');
  await expect(results.first()).toBeVisible();

  expect(errors).toEqual([]);
});

test('账单：年付切换价格、对比表、常见问题、用量切换、发票筛选翻页、添加卡片、开票信息保存', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on(
    'response',
    (r) =>
      r.status() >= 400 &&
      !r.url().endsWith('/favicon.ico') &&
      errors.push(`${r.status()} ${r.url()}`),
  );
  await page.setViewportSize({ width: 1380, height: 900 });
  await page.goto('/recipes/pages/billing.html#plans');

  // 套餐：切到按年付，价格和对比表一起换
  await expect(page.locator('#cmp > tbody:not([data-part])')).toHaveCount(4);
  await page.locator('#cycleSeg [data-value="y"]').click();
  await expect(page.locator('[data-pattern="plan-card"] [data-part="price"] b').nth(1)).toHaveText(
    '82',
  );
  await expect(page.locator('#cmp td[data-m]').nth(2)).toHaveText('¥249 / 月');

  // 常见问题：展开第二条
  const faq = page.locator('.bd-accordion[data-variant="tray"] > details');
  await faq.nth(1).locator('summary').click();
  await expect(faq.nth(1)).toHaveAttribute('open', '');

  // 用量：每日费用切到累计
  await page.locator('.bd-rail [data-go="usage"]').click();
  await page.locator('#costSeg [data-value="cum"]').click();
  await expect(page.locator('#costSub')).toContainText('本期累计费用');

  // 发票：翻到第 2 页；按状态筛选；搜不到时出现空状态，清除筛选后恢复
  await page.locator('.bd-rail [data-go="invoices"]').click();
  await expect(page.locator('#kpiPaid')).not.toBeEmpty();
  await page.locator('#invPager [data-p="2"]').first().click();
  await expect(page.locator('#invPageInfo')).toHaveText('显示 9–11，共 11 张');
  await page.locator('#invSeg [data-value="refund"]').click();
  await expect(page.locator('#invBody tr')).toHaveCount(2);
  await page.locator('#invSearch').fill('不存在');
  await expect(page.locator('#invBody .bd-empty')).toBeVisible();
  await page.locator('#resetInv').click();
  await expect(page.locator('#invBody tr')).toHaveCount(8);

  // 支付方式：空表单保存会标出错误；填好后卡片列表多一张，卡面预览跟着品牌变色
  await page.locator('.bd-rail [data-go="payment"]').click();
  await expect(page.locator('#cardList > .bd-item')).toHaveCount(3);
  await page.locator('#ccSave').click();
  await expect(page.locator('#ccNo')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#ccNo').fill('5212345678901234');
  await expect(page.locator('#cardPreview')).toHaveAttribute('data-brand', 'mc');
  await page.locator('#ccExp').fill('0829');
  await page.locator('#ccCvc').fill('123');
  await page.locator('#ccName').fill('Test User');
  await page.locator('#ccSave').click();
  await expect(page.locator('#cardList > .bd-item')).toHaveCount(4);

  // 开票信息：改动后才能保存，保存后按钮回到禁用
  await expect(page.locator('#addrSave')).toBeDisabled();
  await page.locator('#aZip').fill('200000');
  await expect(page.locator('#addrSave')).toBeEnabled();
  await page.locator('#addrSave').click();
  await expect(page.locator('#addrSave')).toBeDisabled();

  expect(errors).toEqual([]);
});
