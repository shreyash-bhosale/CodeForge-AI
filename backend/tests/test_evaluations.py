import asyncio
from app.evaluations.engine import evaluation_engine, BENCHMARK_CASES

def test_evaluation_engine_benchmark_case():
    async def _run():
        case = BENCHMARK_CASES[0]
        result = await evaluation_engine.run_case(case)
        assert result.benchmark_id == "BM-001"
        assert result.passed is True
        assert result.status == "PASSED"
        assert result.duration_seconds > 0

    asyncio.run(_run())
